// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb } from '../../../lib/firebase-admin'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { uploadId, transferId, fileIndex } = req.body

  if (!uploadId || !transferId) {
    return res.status(400).json({ message: 'Missing uploadId or transferId' })
  }

  try {
    const sessionRef  = adminDb.collection('uploadSessions').doc(uploadId)
    const sessionSnap = await sessionRef.get()

    if (!sessionSnap.exists) {
      return res.status(404).json({ message: 'Session not found', uploadId })
    }

    const session = sessionSnap.data()!

    // ✅ Lire tous les chunks depuis la sous-collection (pas depuis le doc principal)
    const chunksSnap = await sessionRef.collection('chunks').orderBy('chunkIndex').get()

    if (chunksSnap.empty) {
      return res.status(400).json({ message: 'No chunks found for this session', uploadId })
    }

    if (chunksSnap.size !== session.totalChunks) {
      return res.status(400).json({
        message: `Chunks incomplets : reçu ${chunksSnap.size}/${session.totalChunks}`,
        received: chunksSnap.size,
        expected: session.totalChunks,
      })
    }

    // Assembler le base64 complet dans l'ordre
    const completeBase64 = chunksSnap.docs
      .sort((a, b) => a.data().chunkIndex - b.data().chunkIndex)
      .map(doc => doc.data().data)
      .join('')

    // Calculer le hash pour vérification d'intégrité
    const fileBuffer = Buffer.from(completeBase64, 'base64')
    const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex')

    const fileId = uuidv4()

    // ✅ Stocker les métadonnées du fichier dans une sous-collection du transfert
    // (jamais le bufferBase64 dans le document principal → sinon dépassement 1MB)
    const transferRef = adminDb.collection('transfers').doc(transferId)
    const transferSnap = await transferRef.get()

    if (!transferSnap.exists) {
      return res.status(404).json({ message: 'Transfer not found', transferId })
    }

    // Stocker les métadonnées dans la sous-collection "files" du transfert
    await transferRef.collection('files').doc(fileId).set({
      id: fileId,
      name: session.fileName,
      size: session.fileSize,
      type: session.fileType,
      sha256,
      fileIndex: session.fileIndex ?? fileIndex,
      uploadedAt: new Date(),
      totalChunks: session.totalChunks,
      uploadSessionId: uploadId,
    })

    // ✅ Stocker le bufferBase64 dans une sous-collection dédiée "fileData"
    // Découpé en morceaux de 700KB pour éviter le dépassement Firestore
    const MAX_CHUNK_DOC = 700_000 // 700KB par document Firestore

    if (completeBase64.length <= MAX_CHUNK_DOC) {
      // Fichier petit → un seul document
      await transferRef.collection('fileData').doc(fileId).set({
        fileId,
        data: completeBase64,
        parts: 1,
      })
    } else {
      // Fichier gros → plusieurs documents
      const parts: string[] = []
      for (let i = 0; i < completeBase64.length; i += MAX_CHUNK_DOC) {
        parts.push(completeBase64.slice(i, i + MAX_CHUNK_DOC))
      }

      await transferRef.collection('fileData').doc(fileId).set({
        fileId,
        parts: parts.length,
        data: null, // données dans les sous-docs
      })

      for (let i = 0; i < parts.length; i++) {
        await transferRef.collection('fileData').doc(`${fileId}_part_${i}`).set({
          fileId,
          partIndex: i,
          data: parts[i],
        })
      }
    }

    // ✅ Nettoyer la session d'upload et ses chunks
    const chunkDocs = await sessionRef.collection('chunks').get()
    const deletePromises = chunkDocs.docs.map(d => d.ref.delete())
    await Promise.all(deletePromises)
    await sessionRef.delete()

    console.log(`[Complete] File ${session.fileName} assembled — ${fileBuffer.length} bytes — fileId: ${fileId}`)

    return res.status(200).json({ ok: true, fileId, sha256 })
  } catch (error: any) {
    console.error('[Complete] Error:', error)
    return res.status(500).json({
      message: 'File assembly failed',
      error: error?.message || String(error),
      code: error?.code || null,
    })
  }
}