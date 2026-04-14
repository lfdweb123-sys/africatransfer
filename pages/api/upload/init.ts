// pages/api/upload/init.ts
// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb } from '../../../lib/firebase-admin'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { transferId, fileIndex, fileName, fileSize, fileType, totalChunks } = req.body

  if (!transferId || fileIndex === undefined || !fileName) {
    return res.status(400).json({ message: 'Missing fields' })
  }

  const uploadId = uuidv4()

  // Store upload session
  await adminDb.collection('uploadSessions').doc(uploadId).set({
    uploadId,
    transferId,
    fileIndex,
    fileName,
    fileSize,
    fileType,
    totalChunks,
    receivedChunks: 0,
    status: 'in_progress',
    createdAt: new Date(),
    chunks: [],
  })

  return res.status(200).json({ uploadId })
}