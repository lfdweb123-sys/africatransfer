import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb, adminStorage } from '../../../lib/firebase-admin'

// Call this endpoint via a cron job (e.g. Vercel Cron, GitHub Actions, or external cron)
// Set up in vercel.json: { "crons": [{ "path": "/api/cron/cleanup", "schedule": "0 2 * * *" }] }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Protect with secret
  const secret = req.headers['x-cron-secret'] || req.query.secret
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  const now = new Date()
  let deleted = 0
  let errors = 0

  try {
    // Find all expired transfers still marked as active
    const snap = await adminDb.collection('transfers')
      .where('status', '==', 'active')
      .where('expiresAt', '<', now)
      .limit(100) // process in batches
      .get()

    console.log(`Found ${snap.size} expired transfers to clean up`)

    for (const doc of snap.docs) {
      try {
        const transfer = doc.data()
        const bucket = adminStorage.bucket()

        // Delete all files from storage
        for (const file of (transfer.files || [])) {
          if (file.storagePath) {
            try {
              await bucket.file(file.storagePath).delete()
            } catch (e: any) {
              if (e.code !== 404) {
                console.error(`Error deleting file ${file.storagePath}:`, e.message)
              }
            }
          }
        }

        // Delete uploadedFiles subcollection
        const filesSnap = await doc.ref.collection('uploadedFiles').get()
        for (const fileDoc of filesSnap.docs) {
          await fileDoc.ref.delete()
        }

        // Mark transfer as deleted (don't fully delete to keep stats)
        await doc.ref.update({
          status: 'deleted',
          deletedAt: now,
          files: [], // clear file references
        })

        deleted++
      } catch (err) {
        console.error(`Error processing transfer ${doc.id}:`, err)
        errors++
      }
    }

    // Also clean up any orphaned upload sessions older than 24h
    const oldSessionsSnap = await adminDb.collection('uploadSessions')
      .where('createdAt', '<', new Date(Date.now() - 24 * 60 * 60 * 1000))
      .limit(50)
      .get()

    for (const sessionDoc of oldSessionsSnap.docs) {
      const session = sessionDoc.data()
      const bucket = adminStorage.bucket()

      // Delete chunks
      for (const chunkPath of (session.chunks || [])) {
        if (chunkPath) {
          try {
            await bucket.file(chunkPath).delete()
          } catch (e) {}
        }
      }
      await sessionDoc.ref.delete()
    }

    // Downgrade expired premium plans
    const expiredPremiumSnap = await adminDb.collection('users')
      .where('plan', '==', 'premium')
      .where('planExpiresAt', '<', now)
      .get()

    for (const userDoc of expiredPremiumSnap.docs) {
      await userDoc.ref.update({
        plan: 'free',
        planExpiredAt: now,
      })
      console.log(`Downgraded user ${userDoc.id} to free plan`)
    }

    console.log(`Cleanup complete: ${deleted} transfers deleted, ${errors} errors, ${oldSessionsSnap.size} orphaned sessions cleaned`)

    return res.status(200).json({
      ok: true,
      deleted,
      errors,
      orphanedSessionsCleaned: oldSessionsSnap.size,
      premiumExpired: expiredPremiumSnap.size,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('Cleanup cron error:', error)
    return res.status(500).json({ message: 'Cleanup failed', error: String(error) })
  }
}
