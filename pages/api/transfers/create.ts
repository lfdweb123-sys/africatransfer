import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb } from '../../../lib/firebase-admin'
import { PLANS } from '../../../lib/types'
import { v4 as uuidv4 } from 'uuid'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import { addDays, addYears } from 'date-fns'

// Generate short ID for shareable links
function generateShareId(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const {
    senderName, senderEmail, message, password,
    plan, recipientEmails, filesMeta, userId,
  } = req.body

  if (!senderName || !senderEmail || !filesMeta?.length) {
    return res.status(400).json({ message: 'Champs requis manquants' })
  }

  const planConfig = PLANS[plan as 'free' | 'premium'] || PLANS.free

  // Validate total size
  const totalSize = filesMeta.reduce((acc: number, f: any) => acc + f.size, 0)
  if (totalSize > planConfig.maxTransferSize) {
    return res.status(400).json({ message: `Taille totale dépassée (max ${planConfig.maxTransferSize / 1e9} Go)` })
  }

  // Compute expiration
  const now = new Date()
  const expiresAt = planConfig.retentionDays === 365
    ? addYears(now, 1)
    : addDays(now, planConfig.retentionDays)

  // Hash password if provided
  let passwordHash: string | null = null
  if (password) {
    passwordHash = await bcrypt.hash(password, 10)
  }

  const transferId = uuidv4()
  const shareId = generateShareId()

  const transferData: any = {
    id: transferId,
    shareId,
    ownerId: userId || null,
    ownerEmail: senderEmail,
    senderName,
    senderEmail,
    recipientEmails: recipientEmails || [],
    message: message || null,
    passwordHash,
    expiresAt,
    createdAt: new Date(),
    downloadCount: 0,
    totalSize,
    plan: plan || 'free',
    status: 'pending', // becomes 'active' after finalize
    files: [], // filled during finalize
    filesMeta, // temp, removed after finalize
  }

  await adminDb.collection('transfers').doc(transferId).set(transferData)

  return res.status(200).json({ transferId, shareId })
}
