import type { NextApiRequest, NextApiResponse } from 'next'
import { sendContactEmail, sendContactConfirmationEmail } from '../../lib/brevo'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, subject, message } = req.body
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Tous les champs sont requis' })
  }

  const subjectLabels: Record<string, string> = {
    support: 'Problème technique / Support',
    billing: 'Facturation / Paiement',
    partnership: 'Partenariat / Business',
    feature: 'Suggestion de fonctionnalité',
    abuse: "Signalement d'abus",
    other: 'Autre',
  }

  try {
    // ✅ Envoyer à l'admin
    await sendContactEmail({
      name,
      email,
      subject: subjectLabels[subject] || subject,
      message,
    })
    console.log(`[CONTACT] ✅ Email admin envoyé`)

    // ✅ Envoyer une confirmation à l'utilisateur
    await sendContactConfirmationEmail({ name, email, subject: subjectLabels[subject] || subject })
    console.log(`[CONTACT] ✅ Confirmation envoyée à ${email}`)

    return res.status(200).json({ ok: true })

  } catch (error: any) {
    // ✅ Logger TOUTE l'erreur Brevo en détail
    console.error('[CONTACT] ❌ Erreur complète:', JSON.stringify(error, null, 2))
    console.error('[CONTACT] ❌ Message:', error.message)
    console.error('[CONTACT] ❌ Stack:', error.stack)
    return res.status(500).json({
      message: 'Erreur envoi email',
      error: error.message,
      detail: JSON.stringify(error),
    })
  }
}