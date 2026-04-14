// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb, adminAuth } from '../../../lib/firebase-admin'

// ─── Helpers ──────────────────────────────────────────────────────────────

function cors(res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key')
}

// Fonction utilitaire pour convertir les dates Firebase en toute sécurité
function safeDateToISO(dateField: any): string | null {
  if (!dateField) return null
  try {
    if (typeof dateField.toDate === 'function') {
      return dateField.toDate().toISOString()
    }
    if (dateField instanceof Date) {
      return dateField.toISOString()
    }
    if (typeof dateField === 'string') {
      return new Date(dateField).toISOString()
    }
    return null
  } catch (e) {
    return null
  }
}

function isDateExpired(dateField: any): boolean {
  if (!dateField) return false
  try {
    let date: Date
    if (typeof dateField.toDate === 'function') {
      date = dateField.toDate()
    } else if (dateField instanceof Date) {
      date = dateField
    } else if (typeof dateField === 'string') {
      date = new Date(dateField)
    } else {
      return false
    }
    return date < new Date()
  } catch (e) {
    return false
  }
}

async function verifyPremiumUser(req: NextApiRequest) {
  // Méthode 1: Bearer token Firebase
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      const decoded = await adminAuth.verifyIdToken(token)
      const userSnap = await adminDb.collection('users').doc(decoded.uid).get()
      const userData = userSnap.data()
      
      if (!userData) return null
      if (userData.plan !== 'premium') return { error: 'plan_required' }
      
      // Vérification sécurisée de l'expiration
      if (userData.planExpiresAt && isDateExpired(userData.planExpiresAt)) {
        return { error: 'plan_expired' }
      }
      
      return { uid: decoded.uid, ...userData }
    } catch (error) {
      console.error('Bearer token error:', error)
      return null
    }
  }

  // Méthode 2: API Key (pour extension Chrome)
  const apiKey = req.headers['x-api-key'] as string
  if (apiKey) {
    try {
      console.log('Verifying API key:', apiKey.substring(0, 20) + '...')
      
      const keySnap = await adminDb.collection('apiKeys')
        .where('key', '==', apiKey)
        .where('active', '==', true)
        .limit(1)
        .get()

      if (keySnap.empty) {
        console.log('API key not found or inactive')
        return null
      }

      const keyData = keySnap.docs[0].data()
      console.log('API key found for user:', keyData.userId)
      
      const userSnap = await adminDb.collection('users').doc(keyData.userId).get()
      const userData = userSnap.data()

      if (!userData) {
        console.log('User not found for API key')
        return null
      }
      
      if (userData.plan !== 'premium') {
        console.log('User plan is not premium:', userData.plan)
        return { error: 'plan_required' }
      }
      
      // Vérification sécurisée de l'expiration
      if (userData.planExpiresAt && isDateExpired(userData.planExpiresAt)) {
        console.log('Plan expired')
        return { error: 'plan_expired' }
      }

      // Mise à jour des statistiques d'utilisation
      await keySnap.docs[0].ref.update({
        lastUsedAt: new Date(),
        usageCount: (keyData.usageCount || 0) + 1,
      })

      return { uid: keyData.userId, ...userData }
    } catch (error) {
      console.error('API key verification error:', error)
      return null
    }
  }

  return null
}

// ─── Handler principal ─────────────────────────────────────────────────────

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS
  cors(res)
  
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Ajout de logs pour déboguer
  console.log(`[API] Method: ${req.method}, Query:`, req.query)
  console.log(`[API] Has API Key: ${!!req.headers['x-api-key']}`)

  // Vérification de l'utilisateur
  const user = await verifyPremiumUser(req)

  if (!user) {
    console.log('[API] Unauthorized - no user found')
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Clé API ou token invalide. Obtenez votre clé sur africatransfer-b12m.vercel.app/dashboard/api',
    })
  }

  if (user.error === 'plan_required') {
    console.log('[API] Premium required')
    return res.status(403).json({
      error: 'premium_required',
      message: 'L\'accès à l\'API nécessite un plan Premium.',
      upgrade_url: 'https://africatransfer-b12m.vercel.app/pricing',
    })
  }

  if (user.error === 'plan_expired') {
    console.log('[API] Plan expired')
    return res.status(403).json({
      error: 'plan_expired',
      message: 'Votre plan Premium a expiré. Renouvelez-le.',
      renew_url: 'https://africatransfer-b12m.vercel.app/checkout',
    })
  }

  console.log('[API] User authorized:', user.uid)

  const { action } = req.query

  // ── GET /api/v1/transfers — lister les transferts ──────────────────────
  if (req.method === 'GET' && !action) {
    try {
      const { limit: lim = '20', status } = req.query
      let q = adminDb.collection('transfers')
        .where('ownerId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .limit(Math.min(parseInt(lim as string), 50))

      const snap = await q.get()
      
      const transfers = snap.docs
        .map(doc => {
          const d = doc.data()
          const expired = isDateExpired(d.expiresAt)
          
          if (status === 'active' && (expired || d.status !== 'active')) return null
          if (status === 'expired' && !expired) return null
          
          return {
            id: doc.id,
            shareId: d.shareId,
            shareLink: `${process.env.NEXT_PUBLIC_APP_URL}/d/${d.shareId}`,
            files: (d.files || []).map((f: any) => ({
              name: f.name,
              size: f.size,
              type: f.type,
              url: f.url,
            })),
            totalSize: d.totalSize,
            downloadCount: d.downloadCount,
            status: expired ? 'expired' : d.status,
            hasPassword: !!d.passwordHash,
            message: d.message || null,
            expiresAt: safeDateToISO(d.expiresAt),
            createdAt: safeDateToISO(d.createdAt),
          }
        })
        .filter(Boolean)

      console.log(`[API] Returning ${transfers.length} transfers`)
      
      return res.status(200).json({
        ok: true,
        count: transfers.length,
        transfers,
      })
    } catch (error) {
      console.error('[API] List error:', error)
      return res.status(500).json({ 
        error: 'server_error',
        message: error.message 
      })
    }
  }

  // ── GET /api/v1/transfers?action=get&shareId=xxx ───────────────────────
  if (req.method === 'GET' && action === 'get') {
    const { shareId } = req.query
    if (!shareId) {
      return res.status(400).json({ error: 'shareId requis' })
    }

    try {
      const snap = await adminDb.collection('transfers')
        .where('shareId', '==', shareId)
        .where('ownerId', '==', user.uid)
        .limit(1)
        .get()

      if (snap.empty) {
        return res.status(404).json({ error: 'Transfer non trouvé' })
      }

      const d = snap.docs[0].data()
      return res.status(200).json({
        ok: true,
        transfer: {
          id: snap.docs[0].id,
          shareId: d.shareId,
          shareLink: `${process.env.NEXT_PUBLIC_APP_URL}/d/${d.shareId}`,
          files: (d.files || []).map((f: any) => ({ 
            name: f.name, 
            size: f.size, 
            type: f.type 
          })),
          totalSize: d.totalSize,
          downloadCount: d.downloadCount,
          status: d.status,
          expiresAt: safeDateToISO(d.expiresAt),
          createdAt: safeDateToISO(d.createdAt),
        },
      })
    } catch (error) {
      console.error('[API] Get transfer error:', error)
      return res.status(500).json({ 
        error: 'server_error',
        message: error.message 
      })
    }
  }

  // ── DELETE /api/v1/transfers?shareId=xxx ──────────────────────────────
  if (req.method === 'DELETE') {
    const { shareId } = req.query
    if (!shareId) {
      return res.status(400).json({ error: 'shareId requis' })
    }

    try {
      const snap = await adminDb.collection('transfers')
        .where('shareId', '==', shareId)
        .where('ownerId', '==', user.uid)
        .limit(1)
        .get()

      if (snap.empty) {
        return res.status(404).json({ error: 'Transfer non trouvé' })
      }

      await snap.docs[0].ref.update({ 
        status: 'deleted', 
        deletedAt: new Date() 
      })
      
      return res.status(200).json({ 
        ok: true, 
        message: 'Transfer supprimé' 
      })
    } catch (error) {
      console.error('[API] Delete error:', error)
      return res.status(500).json({ 
        error: 'server_error',
        message: error.message 
      })
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' })
}
