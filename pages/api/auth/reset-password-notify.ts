// pages/api/auth/reset-password-notify.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb } from '../../../lib/firebase-admin'
import { sendResetPasswordEmail } from '../../../lib/brevo'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email } = req.body
  if (!email) return res.status(400).json({ message: 'email requis' })

  try {
    // Récupérer le nom de l'utilisateur depuis Firestore
    const snap = await adminDb
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get()

    const name = snap.empty
      ? email.split('@')[0]
      : (snap.docs[0].data().displayName || email.split('@')[0])

    await sendResetPasswordEmail({ email, name })
    console.log(`[ResetNotify] Email envoyé à ${email}`)
    return res.status(200).json({ ok: true })
  } catch (error: any) {
    console.error('[ResetNotify] Erreur:', error.message)
    return res.status(500).json({ message: 'Erreur envoi email', error: error.message })
  }
}