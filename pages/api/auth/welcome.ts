import type { NextApiRequest, NextApiResponse } from 'next'
import { sendWelcomeEmail } from '../../../lib/brevo'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, name } = req.body
  if (!email || !name) return res.status(400).json({ message: 'email et name requis' })

  try {
    await sendWelcomeEmail({ email, name })
    console.log(`[WELCOME] Email envoyé à ${email}`)
    return res.status(200).json({ ok: true })
  } catch (error: any) {
    console.error('[WELCOME] Erreur:', error.message)
    return res.status(500).json({ message: 'Erreur envoi email', error: error.message })
  }
}