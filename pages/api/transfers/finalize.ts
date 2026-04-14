// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb } from '../../../lib/firebase-admin'
import { sendTransferLinkEmail } from '../../../lib/brevo'
import { formatBytes } from '../../../lib/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { transferId, mode } = req.body
  if (!transferId) return res.status(400).json({ message: 'transferId required' })

  try {
    const transferRef  = adminDb.collection('transfers').doc(transferId)
    const snap         = await transferRef.get()

    if (!snap.exists) {
      return res.status(404).json({ message: 'Transfer not found', transferId })
    }

    const data = snap.data()!

    // ✅ Récupérer les métadonnées des fichiers depuis la sous-collection
    const filesSnap = await transferRef.collection('files').orderBy('fileIndex').get()

    if (filesSnap.empty) {
      return res.status(400).json({
        message: 'No files found for this transfer',
        transferId,
        hint: 'La sous-collection "files" est vide. Vérifiez que complete.ts a bien été appelé.',
      })
    }

    // Juste les métadonnées (sans bufferBase64) pour la mise à jour du statut
    const filesMeta = filesSnap.docs.map(doc => {
      const f = doc.data()
      return {
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        fileIndex: f.fileIndex,
        sha256: f.sha256,
        uploadedAt: f.uploadedAt,
      }
    })

    // Vérifications de configuration
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!appUrl) {
      return res.status(500).json({
        message: 'Configuration manquante',
        error: 'NEXT_PUBLIC_APP_URL non défini',
      })
    }

    if (!data.shareId) {
      return res.status(500).json({
        message: 'Données manquantes',
        error: 'shareId absent du document Firestore',
        transferId,
      })
    }

    const shareLink = appUrl + '/d/' + data.shareId

    // Sécuriser expiresAt
    let expiresAtDate: Date
    try {
      expiresAtDate = data.expiresAt?.toDate
        ? data.expiresAt.toDate()
        : data.expiresAt
          ? new Date(data.expiresAt)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    } catch (dateErr) {
      return res.status(500).json({
        message: 'Erreur de conversion de date expiresAt',
        error: String(dateErr),
        expiresAtValue: String(data.expiresAt),
      })
    }

    // ✅ Mettre à jour le statut SANS stocker les bufferBase64 dans le document principal
    await transferRef.update({
      status: 'active',
      fileCount: filesMeta.length,
      totalSize: data.totalSize || filesMeta.reduce((acc, f) => acc + (f.size || 0), 0),
      // filesMeta: null  ← plus besoin, on n'utilise plus filesMeta
    })

    // Envoyer les emails si mode 'send'
    if (mode === 'send' && data.recipientEmails?.length > 0) {
      const emailErrors: string[] = []

      for (const email of data.recipientEmails) {
        try {
          await sendTransferLinkEmail({
            recipientEmail: email,
            senderName:     data.senderName  || 'Expéditeur',
            senderEmail:    data.senderEmail || '',
            shareLink,
            message:        data.message    || '',
            expiresAt:      expiresAtDate,
            totalSize:      formatBytes(data.totalSize || 0),
            fileCount:      filesMeta.length,
          })
        } catch (e: any) {
          console.error(`[Finalize] Email error for ${email}:`, e)
          emailErrors.push(`${email}: ${e?.message || String(e)}`)
        }
      }

      return res.status(200).json({
        shareId:   data.shareId,
        shareLink,
        fileCount: filesMeta.length,
        ...(emailErrors.length > 0 && { emailErrors }),
      })
    }

    return res.status(200).json({
      shareId:   data.shareId,
      shareLink,
      fileCount: filesMeta.length,
    })

  } catch (error: any) {
    console.error('[Finalize] Error:', error)
    return res.status(500).json({
      message: 'Erreur serveur',
      error:   error?.message || String(error),
      code:    error?.code    || null,
      stack:   process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    })
  }
}