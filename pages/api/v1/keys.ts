// pages/api/v1/keys.ts - Version corrigée
// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb, adminAuth } from '../../../lib/firebase-admin'
import { v4 as uuidv4 } from 'uuid'

function generateApiKey(): string {
  const prefix = 'at_live_'
  const random = uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '')
  return prefix + random.slice(0, 48)
}

async function getUser(req: NextApiRequest) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice(7))
    const snap = await adminDb.collection('users').doc(decoded.uid).get()
    const userData = snap.data()
    if (userData?.plan !== 'premium') return { error: 'premium_required' }
    return { uid: decoded.uid, ...userData }
  } catch {
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const user = await getUser(req)
  if (!user) return res.status(401).json({ error: 'unauthorized' })
  if (user.error) return res.status(403).json({ error: user.error })

  // GET — lister les clés
  if (req.method === 'GET') {
    try {
      // Récupérer TOUTES les clés (sans filtre userId d'abord pour tester)
      const allSnap = await adminDb.collection('apiKeys').get()
      console.log('Total keys in DB:', allSnap.size)
      
      // Ensuite filtrer par userId
      const snap = await adminDb.collection('apiKeys')
        .where('userId', '==', user.uid)
        .get()
      
      console.log('Keys found for user:', snap.size)
      console.log('User UID:', user.uid)
      
      const keys = snap.docs.map(d => {
        const data = d.data()
        return {
          id: d.id,
          name: data.name,
          keyPreview: data.key ? (data.key.slice(0, 12) + '...' + data.key.slice(-6)) : 'no-key',
          active: data.active,
          usageCount: data.usageCount || 0,
          lastUsedAt: data.lastUsedAt?.toDate?.()?.toISOString() || null,
          createdAt: data.createdAt?.toDate?.()?.toISOString(),
        }
      })
      
      return res.status(200).json({ ok: true, keys, debug: { userUid: user.uid, totalInDB: allSnap.size } })
    } catch (error) {
      console.error('Error:', error)
      return res.status(500).json({ error: 'Erreur', details: error.message })
    }
  }

  // POST — créer une clé
  if (req.method === 'POST') {
    const { name = 'Ma clé API' } = req.body

    // Max 3 clés par utilisateur
    const existing = await adminDb.collection('apiKeys')
      .where('userId', '==', user.uid)
      .where('active', '==', true)
      .get()
    if (existing.size >= 3) {
      return res.status(400).json({ error: 'Limite de 3 clés API atteinte. Supprimez-en une.' })
    }

    const key = generateApiKey()
    const docRef = await adminDb.collection('apiKeys').add({
      userId: user.uid,
      name,
      key,
      active: true,
      usageCount: 0,
      createdAt: new Date(),
      lastUsedAt: null,
    })

    return res.status(201).json({
      ok: true,
      message: 'Clé créée. Copiez-la maintenant, elle ne sera plus affichée.',
      apiKey: {
        id: docRef.id,
        name,
        key,
        createdAt: new Date().toISOString(),
      },
    })
  }

  // DELETE — révoquer une clé
  if (req.method === 'DELETE') {
    const { keyId } = req.query
    if (!keyId) return res.status(400).json({ error: 'keyId requis' })

    const keyRef = adminDb.collection('apiKeys').doc(keyId as string)
    const keySnap = await keyRef.get()
    if (!keySnap.exists || keySnap.data()?.userId !== user.uid) {
      return res.status(404).json({ error: 'Clé non trouvée' })
    }

    await keyRef.update({ active: false, revokedAt: new Date() })
    return res.status(200).json({ ok: true, message: 'Clé révoquée' })
  }

  return res.status(405).json({ error: 'Méthode non autorisée' })
}