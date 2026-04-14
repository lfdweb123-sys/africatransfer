// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb } from '../../../lib/firebase-admin'
import { IncomingForm } from 'formidable'
import fs from 'fs'

export const config = {
  api: { bodyParser: false },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024,
      keepExtensions: true,
    })

    const { fields, files } = await new Promise<any>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    })

    const uploadId     = fields.uploadId?.[0]    ?? fields.uploadId    ?? ''
    const chunkIndex   = parseInt(fields.chunkIndex?.[0]  ?? fields.chunkIndex  ?? '0')
    const totalChunks  = parseInt(fields.totalChunks?.[0] ?? fields.totalChunks ?? '1')
    const fileName     = fields.fileName?.[0]    ?? fields.fileName    ?? ''
    const fileType     = fields.fileType?.[0]    ?? fields.fileType    ?? ''
    const fileSize     = parseInt(fields.fileSize?.[0] ?? fields.fileSize ?? '0')
    const transferId   = fields.transferId?.[0]  ?? fields.transferId  ?? ''
    const fileIndex    = parseInt(fields.fileIndex?.[0]   ?? fields.fileIndex   ?? '0')
    const chunkFile    = files.chunk?.[0] ?? files.chunk ?? null

    if (!uploadId || !transferId) {
      return res.status(400).json({ message: 'Missing uploadId or transferId' })
    }
    if (!chunkFile) {
      return res.status(400).json({ message: 'Missing chunk file' })
    }

    // Lire le chunk et encoder en base64
    const chunkData   = fs.readFileSync(chunkFile.filepath)
    const chunkBase64 = chunkData.toString('base64')
    fs.unlinkSync(chunkFile.filepath)

    console.log(`[Chunk] ${chunkIndex + 1}/${totalChunks} — uploadId: ${uploadId} — size: ${chunkData.length}B`)

    // ✅ Stocker chaque chunk dans une sous-collection (jamais dans le document principal)
    // Chaque doc de chunk fait max ~700KB → jamais de dépassement Firestore
    const sessionRef = adminDb.collection('uploadSessions').doc(uploadId)
    const sessionSnap = await sessionRef.get()

    if (!sessionSnap.exists) {
      // Créer la session si premier chunk
      await sessionRef.set({
        uploadId,
        transferId,
        fileIndex,
        fileName,
        fileType,
        fileSize,
        totalChunks,
        receivedChunks: 0,
        createdAt: new Date(),
      })
    }

    // ✅ Chaque chunk = un document séparé dans la sous-collection "chunks"
    await sessionRef.collection('chunks').doc(String(chunkIndex)).set({
      chunkIndex,
      data: chunkBase64,
      size: chunkData.length,
      savedAt: new Date(),
    })

    // Incrémenter le compteur de chunks reçus
    const currentSnap = await sessionRef.get()
    const current = currentSnap.data()!
    await sessionRef.update({
      receivedChunks: (current.receivedChunks || 0) + 1,
      lastUpdated: new Date(),
    })

    return res.status(200).json({
      ok: true,
      chunkIndex,
      received: (current.receivedChunks || 0) + 1,
      total: totalChunks,
    })
  } catch (error: any) {
    console.error('[Chunk] Error:', error)
    return res.status(500).json({
      message: 'Chunk upload failed',
      error: error?.message || String(error),
      code: error?.code || null,
    })
  }
}