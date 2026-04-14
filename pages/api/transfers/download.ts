// pages/api/transfers/download.ts
// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb } from '../../../lib/firebase-admin'
import { sendDownloadConfirmationEmail } from '../../../lib/brevo'
import { FieldValue } from 'firebase-admin/firestore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { shareId, fileId } = req.body

  if (!shareId || !fileId) {
    return res.status(400).json({ error: 'shareId et fileId requis' })
  }

  try {
    // 1. Trouver le transfert
    const snap = await adminDb
      .collection('transfers')
      .where('shareId', '==', shareId)
      .where('status', '==', 'active')
      .limit(1)
      .get()

    if (snap.empty) {
      return res.status(404).json({ error: 'Transfer not found', shareId })
    }

    const docRef = snap.docs[0].ref
    const data   = snap.docs[0].data()

    // Vérifier expiration
    const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt)
    if (expiresAt < new Date()) {
      await docRef.update({ status: 'expired' })
      return res.status(410).json({ error: 'Ce lien a expiré' })
    }

    // 2. Récupérer les métadonnées du fichier depuis la sous-collection "files"
    const fileMetaSnap = await docRef.collection('files').doc(fileId).get()

    if (!fileMetaSnap.exists) {
      return res.status(404).json({
        error: 'File not found',
        fileId,
        hint: 'Le fichier n\'existe pas dans la sous-collection "files"',
      })
    }

    const fileMeta = fileMetaSnap.data()!

    // 3. Reconstruire le bufferBase64 depuis la sous-collection "fileData"
    let bufferBase64 = ''

    const fileDataSnap = await docRef.collection('fileData').doc(fileId).get()

    if (!fileDataSnap.exists) {
      return res.status(404).json({
        error: 'File data not found',
        fileId,
        hint: 'Les données du fichier n\'existent pas dans la sous-collection "fileData"',
      })
    }

    const fileData = fileDataSnap.data()!

    if (fileData.parts === 1 || fileData.data) {
      // Fichier stocké en un seul document
      bufferBase64 = fileData.data
    } else {
      // Fichier découpé en plusieurs parties → les assembler dans l'ordre
      const partPromises: Promise<string>[] = []

      for (let i = 0; i < fileData.parts; i++) {
        partPromises.push(
          docRef.collection('fileData').doc(`${fileId}_part_${i}`).get()
            .then(partSnap => {
              if (!partSnap.exists) {
                throw new Error(`Partie manquante : ${fileId}_part_${i}`)
              }
              return partSnap.data()!.data as string
            })
        )
      }

      const parts = await Promise.all(partPromises)
      bufferBase64 = parts.join('')
    }

    if (!bufferBase64) {
      return res.status(500).json({
        error: 'Données du fichier vides',
        fileId,
      })
    }

    // 4. Décoder en buffer binaire
    const buffer = Buffer.from(bufferBase64, 'base64')

    if (buffer.length === 0) {
      return res.status(500).json({ error: 'Buffer vide après décodage', fileId })
    }

    // 5. Incrémenter le compteur de téléchargements
    await docRef.update({ downloadCount: FieldValue.increment(1) })

    // 6. Notifier le propriétaire (sans bloquer la réponse)
    notifyOwner(data, fileMeta.name, shareId, req).catch(e =>
      console.error('[Download] Notification email failed:', e)
    )

    // 7. Envoyer le fichier
    res.setHeader('Content-Type', fileMeta.type || 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileMeta.name)}"`)
    res.setHeader('Content-Length', buffer.length)
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')

    return res.status(200).send(buffer)

  } catch (error: any) {
    console.error('[Download] Error:', error)
    return res.status(500).json({
      error: 'Erreur serveur',
      message: error?.message || String(error),
      code: error?.code || null,
    })
  }
}

async function notifyOwner(
  data: any,
  fileName: string,
  shareId: string,
  req: NextApiRequest
) {
  if (!data.senderEmail) return

  const ip = String(
    req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Inconnu'
  )
  const shareLink = `${process.env.NEXT_PUBLIC_APP_URL}/d/${shareId}`

  await sendDownloadConfirmationEmail({
    ownerEmail: data.senderEmail,
    ownerName:  data.senderName || 'Utilisateur',
    downloaderInfo: ip,
    fileName,
    shareLink,
  })
}