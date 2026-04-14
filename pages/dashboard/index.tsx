import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../../lib/auth-context'
import Navbar from '../../components/Navbar'
import { db } from '../../lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { formatBytes } from '../../lib/types'
import {
  Upload, FileText, Clock, ArrowUpRight, Star,
  TrendingUp, HardDrive, LayoutDashboard, Key
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function Dashboard() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [transfers, setTransfers] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, totalSize: 0, downloads: 0 })
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login?redirect=/dashboard')
  }, [user, loading, router])

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  async function fetchData() {
    setLoadingData(true)
    try {
      const q = query(
        collection(db, 'transfers'),
        where('ownerId', '==', user!.uid)
      )
      const snap = await getDocs(q)

      const toDate = (val: any): Date => {
        if (!val) return new Date(0)
        if (typeof val?.toDate === 'function') return val.toDate()
        const d = new Date(val)
        return isNaN(d.getTime()) ? new Date(0) : d
      }

      const docs = snap.docs
        .map(d => ({ id: d.id, ...d.data(), _createdAt: toDate(d.data().createdAt) }))
        .sort((a: any, b: any) => b._createdAt.getTime() - a._createdAt.getTime())

      const now = new Date()
      const active = docs.filter((d: any) => {
        const exp = toDate(d.expiresAt)
        return d.status === 'active' && exp > now
      }).length
      const totalSize = docs.reduce((acc: number, d: any) => acc + (d.totalSize || 0), 0)
      const downloads = docs.reduce((acc: number, d: any) => acc + (d.downloadCount || 0), 0)

      setStats({ total: docs.length, active, totalSize, downloads })
      setTransfers(docs.slice(0, 10))
    } catch (err: any) {
      console.error('[dashboard] fetchData error:', err)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || !user) return null

  const plan = userData?.plan || 'free'

  const toDate = (val: any): Date => {
    if (!val) return new Date(0)
    if (typeof val?.toDate === 'function') return val.toDate()
    const d = new Date(val)
    return isNaN(d.getTime()) ? new Date(0) : d
  }

  return (
    <>
      <Head><title>Tableau de bord — AfricaTransfer</title></Head>
      <Navbar />

      <div className="pt-16 min-h-screen" style={{ background: '#FAFAFA' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LayoutDashboard size={16} className="text-gray-400" />
                <span className="text-sm text-gray-400">Tableau de bord</span>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Bonjour, {userData?.displayName?.split(' ')[0] || 'là'} 👋
              </h1>
            </div>
            <Link href="/" className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium">
              <Upload size={16} />
              Nouveau transfert
            </Link>
          </div>

          {/* Banner Premium upgrade */}
          {plan === 'free' && (
            <div className="rounded-2xl p-5 mb-8 flex items-center gap-4 animate-slide-up"
              style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)', border: '1px solid #262626' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#C9972A,#E4B84A)' }}>
                <Star size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">Passez Premium</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  200 Go par transfert, fichiers disponibles 1 an, API, extension Chrome.
                </p>
              </div>
              <Link href="/pricing" className="btn-gold px-4 py-2 rounded-lg text-sm flex-shrink-0">
                Découvrir <ArrowUpRight size={14} className="inline" />
              </Link>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: <FileText size={18} style={{ color: '#C9972A' }} />, label: 'Transferts', val: stats.total },
              { icon: <TrendingUp size={18} style={{ color: '#10B981' }} />, label: 'Actifs', val: stats.active },
              { icon: <HardDrive size={18} style={{ color: '#3B82F6' }} />, label: 'Volume envoyé', val: formatBytes(stats.totalSize) },
              { icon: <ArrowUpRight size={18} style={{ color: '#8B5CF6' }} />, label: 'Téléchargements', val: stats.downloads },
            ].map((s, i) => (
              <div key={i} className="card p-5 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-center gap-2 mb-2">
                  {s.icon}
                  <span className="text-xs text-gray-400">{s.label}</span>
                </div>
                <p className="text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  {s.val}
                </p>
              </div>
            ))}
          </div>

          {/* Carte API — Premium uniquement */}
          {plan === 'premium' && (
            <Link href="/dashboard/api"
              className="card card-hover p-5 mb-6 flex items-center gap-4 animate-slide-up no-underline block"
              style={{ border: '1px solid #E5E5E5' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#C9972A,#E4B84A)' }}>
                <Key size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-gray-900 text-sm">API publique & Extension Chrome</p>
                  <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: 'linear-gradient(135deg,#C9972A,#E4B84A)', fontSize: '10px' }}>
                    PRO
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Gérez vos clés API, consultez la documentation et installez l'extension Chrome.
                </p>
              </div>
              <ArrowUpRight size={16} className="text-gray-300 flex-shrink-0" />
            </Link>
          )}

          {/* Transferts récents */}
          <div className="card">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Transferts récents</h2>
              <Link href="/dashboard/transfers" className="text-xs text-yellow-600 hover:underline">
                Voir tout →
              </Link>
            </div>

            {loadingData ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-gray-400">Chargement…</p>
              </div>
            ) : transfers.length === 0 ? (
              <div className="p-12 text-center">
                <Upload size={32} className="text-gray-200 mx-auto mb-3" strokeWidth={1} />
                <p className="text-gray-400 text-sm mb-4">Aucun transfert pour l'instant</p>
                <Link href="/" className="btn-gold px-5 py-2 rounded-xl text-sm inline-block">
                  Envoyer des fichiers
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {transfers.map((t: any) => {
                  const expiresAt = toDate(t.expiresAt)
                  const expired = expiresAt < new Date()

                  return (
                    <div key={t.id} className="p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors group">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${expired ? 'bg-gray-100' : 'bg-yellow-50'}`}>
                        <FileText size={16} style={{ color: expired ? '#D4D4D4' : '#C9972A' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {t.files?.[0]?.name || 'Transfert'}
                          {t.files?.length > 1 && (
                            <span className="text-gray-400 font-normal ml-1">+{t.files.length - 1}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatBytes(t.totalSize || 0)}
                          {' · '}
                          {t.downloadCount || 0} téléchargement{t.downloadCount !== 1 ? 's' : ''}
                          {' · '}
                          {expired
                            ? <span className="text-red-400">Expiré</span>
                            : expiresAt.getTime() > 0
                              ? <span>Expire le {format(expiresAt, 'd MMM', { locale: fr })}</span>
                              : null
                          }
                        </p>
                      </div>
                      {!expired && t.shareId && (
                        <Link
                          href={`/d/${t.shareId}`}
                          target="_blank"
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-yellow-600 hover:underline"
                        >
                          Ouvrir <ArrowUpRight size={12} />
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}