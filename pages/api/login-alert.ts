// pages/api/auth/login-alert.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { sendLoginAlertEmail } from '../../lib/brevo'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, name } = req.body
  if (!email || !name) {
    return res.status(400).json({ message: 'email et name requis' })
  }

  // Récupérer l'IP réelle (Vercel passe l'IP dans x-forwarded-for)
  const forwarded = req.headers['x-forwarded-for']
  const ip = (typeof forwarded === 'string'
    ? forwarded.split(',')[0]
    : req.socket?.remoteAddress || '0.0.0.0'
  ).trim()

  // Récupérer l'user-agent pour détecter l'appareil
  const ua = req.headers['user-agent'] || 'Inconnu'
  const device = parseDevice(ua)

  try {
    // Géolocalisation via ip-api.com (gratuit, pas de clé requise)
    let geoData = {
      country: 'Inconnu',
      city: 'Inconnue',
      region: '',
      isp: 'Inconnu',
    }

    try {
      const geoRes = await fetch(
        `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp&lang=fr`,
        { signal: AbortSignal.timeout(3000) } // timeout 3s
      )
      const geo = await geoRes.json()
      if (geo.status === 'success') {
        geoData = {
          country: geo.country   || 'Inconnu',
          city:    geo.city      || 'Inconnue',
          region:  geo.regionName || '',
          isp:     geo.isp       || 'Inconnu',
        }
      }
    } catch (geoErr) {
      // La géoloc échoue → on envoie quand même l'email avec "Inconnu"
      console.warn('[LoginAlert] Géoloc échouée:', geoErr)
    }

    await sendLoginAlertEmail({
      email,
      name,
      ip,
      loginAt: new Date(),
      device,
      ...geoData,
    })

    console.log(`[LoginAlert] Email envoyé à ${email} — IP: ${ip} — ${geoData.city}, ${geoData.country}`)
    return res.status(200).json({ ok: true })

  } catch (error: any) {
    console.error('[LoginAlert] Erreur:', error.message)
    return res.status(500).json({ message: 'Erreur envoi email', error: error.message })
  }
}

function parseDevice(ua: string): string {
  // Mobile
  if (/iPhone/.test(ua)) return 'iPhone (iOS)'
  if (/iPad/.test(ua)) return 'iPad (iOS)'
  if (/Android/.test(ua) && /Mobile/.test(ua)) return 'Android (Mobile)'
  if (/Android/.test(ua)) return 'Android (Tablette)'

  // Desktop OS
  const os = /Windows NT/.test(ua) ? 'Windows'
    : /Mac OS X/.test(ua) ? 'macOS'
    : /Linux/.test(ua) ? 'Linux'
    : /CrOS/.test(ua) ? 'ChromeOS'
    : 'Inconnu'

  // Navigateur
  const browser = /Edg\//.test(ua) ? 'Edge'
    : /OPR\//.test(ua) ? 'Opera'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari'
    : 'Navigateur inconnu'

  return `${browser} sur ${os}`
}