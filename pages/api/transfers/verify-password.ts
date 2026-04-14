import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb } from '../../../lib/firebase-admin'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { shareId, password } = req.body
  if (!shareId || !password) return res.status(400).json({ message: 'Missing fields' })

  try {
    const snap = await adminDb.collection('transfers')
      .where('shareId', '==', shareId)
      .limit(1)
      .get()

    if (snap.empty) return res.status(404).json({ message: 'Not found' })

    const data = snap.docs[0].data()
    if (!data.passwordHash) return res.status(200).json({ ok: true })

    const valid = await bcrypt.compare(password, data.passwordHash)
    if (!valid) return res.status(401).json({ message: 'Wrong password' })

    return res.status(200).json({ ok: true })
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}
