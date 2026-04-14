import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb } from '../../../lib/firebase-admin'
import { verifyTransaction } from '../../../lib/feexpay'
import { addMonths, addYears } from 'date-fns'
import { FieldValue } from 'firebase-admin/firestore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { reference, transaction_id, status } = req.body

  console.log('FeexPay webhook received:', { reference, transaction_id, status })

  try {
    // Find payment by reference
    const paymentSnap = await adminDb.collection('payments')
      .where('reference', '==', reference)
      .limit(1)
      .get()

    if (paymentSnap.empty) {
      console.error('Payment not found for reference:', reference)
      return res.status(404).end()
    }

    const paymentRef = paymentSnap.docs[0].ref
    const payment = paymentSnap.docs[0].data()

    // Verify with FeexPay API
    if (transaction_id) {
      const verification = await verifyTransaction(transaction_id)
      if (verification.status !== 'success') {
        await paymentRef.update({ status: 'failed', updatedAt: new Date() })
        return res.status(200).end()
      }
    } else if (status !== 'success') {
      await paymentRef.update({ status: 'failed', updatedAt: new Date() })
      return res.status(200).end()
    }

    // Payment successful - activate premium
    const now = new Date()
    const planExpiresAt = payment.billing === 'yearly'
      ? addYears(now, 1)
      : addMonths(now, 1)

    // Update payment record
    await paymentRef.update({
      status: 'success',
      paidAt: now,
      updatedAt: now,
      feexpayTransactionId: transaction_id,
    })

    // Upgrade user
    await adminDb.collection('users').doc(payment.userId).update({
      plan: 'premium',
      planExpiresAt,
      planActivatedAt: now,
      updatedAt: now,
    })

    console.log(`User ${payment.userId} upgraded to premium until ${planExpiresAt}`)

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return res.status(500).end()
  }
}
