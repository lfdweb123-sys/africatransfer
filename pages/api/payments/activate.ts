import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb } from '../../../lib/firebase-admin'
import { addMonths, addYears } from 'date-fns'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, email, customId, billing, amount, feexpayResponse } = req.body

  if (!userId || !customId) {
    return res.status(400).json({ message: 'Champs requis manquants' })
  }

  try {
    const now = new Date()
    const planExpiresAt = billing === 'yearly'
      ? addYears(now, 1)
      : addMonths(now, 1)

    // Enregistrer le paiement
    await adminDb.collection('payments').add({
      userId,
      email,
      customId,
      amount,
      currency: 'XOF',
      plan: 'premium',
      billing,
      status: 'success',
      feexpayResponse,
      paidAt: now,
      createdAt: now,
    })

    // Activer le plan Premium
    await adminDb.collection('users').doc(userId).update({
      plan: 'premium',
      planExpiresAt,
      planActivatedAt: now,
      updatedAt: now,
    })

    console.log(`✅ User ${userId} upgraded to premium until ${planExpiresAt}`)

    return res.status(200).json({ ok: true, planExpiresAt })
  } catch (error) {
    console.error('Activation error:', error)
    return res.status(500).json({ message: 'Erreur activation plan' })
  }
}
