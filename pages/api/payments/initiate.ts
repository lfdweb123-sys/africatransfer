import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb } from '../../../lib/firebase-admin'
import { initiatePayment, PLAN_PRICES } from '../../../lib/feexpay'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { plan, billing, phone, operator, customerName, customerEmail, userId } = req.body

  if (!plan || !billing || !phone || !customerName || !customerEmail || !userId) {
    return res.status(400).json({ message: 'Champs requis manquants' })
  }

  const priceKey = billing === 'yearly' ? 'premium_yearly' : 'premium_monthly'
  const priceConfig = PLAN_PRICES[priceKey]

  if (!priceConfig) return res.status(400).json({ message: 'Plan invalide' })

  const paymentId = uuidv4()
  const reference = `AT-${paymentId.slice(0, 8).toUpperCase()}`

  // Create payment record
  await adminDb.collection('payments').doc(paymentId).set({
    id: paymentId,
    userId,
    amount: priceConfig.amount,
    currency: priceConfig.currency,
    plan: 'premium',
    billing,
    status: 'pending',
    reference,
    customerName,
    customerEmail,
    phone,
    operator,
    createdAt: new Date(),
  })

  try {
    const result = await initiatePayment({
      amount: priceConfig.amount,
      currency: priceConfig.currency,
      description: priceConfig.description,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: phone,
      reference,
      payment_method: operator,
    })

    // Update with FeexPay transaction ID
    if (result.transaction_id) {
      await adminDb.collection('payments').doc(paymentId).update({
        feexpayTransactionId: result.transaction_id,
      })
    }

    return res.status(200).json({
      paymentId,
      payment_url: result.payment_url,
      transaction_id: result.transaction_id,
    })
  } catch (error) {
    console.error('FeexPay initiate error:', error)
    await adminDb.collection('payments').doc(paymentId).update({ status: 'failed' })
    return res.status(500).json({ message: 'Erreur de paiement. Réessayez.' })
  }
}
