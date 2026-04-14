import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../../lib/auth-context'
import Navbar from '../../components/Navbar'
import { db } from '../../lib/firebase'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { storage } from '../../lib/firebase'
import { ref, deleteObject } from 'firebase/storage'
import { formatBytes } from '../../lib/types'
import {
  FileText, Trash2, Copy, ExternalLink, CheckCircle,
  Upload, Clock, Download, Search,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
 
export default function Transfers() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [transfers, setTransfers] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
 
  useEffect(() => {
    if (!loading && !user) router.push('/auth/login?redirect=/dashboard/transfers')
  }, [user, loading, router])
 
  useEffect(() => {
    if (user) fetchTransfers()
  }, [user])
 
  async function fetchTransfers() {
    setLoadingData(true)
    try {
      // Pas de orderBy pour éviter l'index composite manquant — on trie côté client
      const q = query(
        collection(db, 'transfers'),
        where('ownerId', '==', user!.uid)
      )
      const snap = await getDocs(q)
 
      const docs = snap.docs.map(d => {
        const data = d.data()
 
        // Conversion robuste des dates Firestore
        const toDate = (val: any): Date => {
          if (!val) return new Date(0)
          if (typeof val?.toDate === 'function') return val.toDate()
          const d = new Date(val)
          return isNaN(d.getTime()) ? new Date(0) : d
        }
 
        return {
          id: d.id,
          ...data,
          expiresAt: toDate(data.expiresAt),
          createdAt: toDate(data.createdAt),
        }
      })
 
      // Tri côté client : plus récent en premier
      docs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
 
      setTransfers(docs)
      setFiltered(docs)
    } catch (err: any) {
      console.error('[transfers] fetchTransfers error:', err)
 
      // Si index manquant, Firestore retourne un message avec un lien de création
      if (err?.message?.includes('index')) {
        toast.error('Index Firestore manquant — voir console pour le lien de création')
        console.warn('[transfers] Créez l\'index ici :', err.message)
      } else {
        toast.error('Erreur de chargement des transferts')
      }
    } finally {
      setLoadingData(false)
    }
  }
 
  useEffect(() => {
    const now = new Date()
    let result = transfers
 
    if (statusFilter === 'active') {
      result = result.filter((t: any) => t.expiresAt > now && t.status === 'active')
    } else if (statusFilter === 'expired') {
      result = result.filter((t: any) => t.expiresAt <= now || t.status === 'expired')
    }
 
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((t: any) =>
        t.files?.some((f: any) => f.name?.toLowerCase().includes(q)) ||
        t.shareId?.toLowerCase().includes(q)
      )
    }
 
    setFiltered(result)
  }, [search, statusFilter, transfers])
 
  async function copyLink(shareId: string) {
    const link = `${window.location.origin}/d/${shareId}`
    await navigator.clipboard.writeText(link)
    setCopiedId(shareId)
    toast.success('Lien copié !')
    setTimeout(() => setCopiedId(null), 3000)
  }
 
  async function deleteTransfer(transfer: any) {
    if (!confirm('Supprimer ce transfert ? Les fichiers seront définitivement supprimés.')) return
    setDeletingId(transfer.id)
    try {
      for (const file of transfer.files || []) {
        if (file.storagePath) {
          try {
            await deleteObject(ref(storage, file.storagePath))
          } catch {
            // Fichier déjà supprimé ou inexistant
          }
        }
      }
      await deleteDoc(doc(db, 'transfers', transfer.id))
      setTransfers(prev => prev.filter(t => t.id !== transfer.id))
      toast.success('Transfert supprimé')
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }
 
  if (loading || !user) return null
 
  return (
    <>
      <Head><title>Mes transferts — AfricaTransfer</title></Head>
      <Navbar />
 
      <div className="pt-16 min-h-screen" style={{ background: '#FAFAFA' }}>
        <div className="max-w-5xl mx-auto px-4 py-10">
 
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm text-gray-400 mb-1">Tableau de bord</p>
              <h1 className="text-2xl font-semibold" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Mes transferts
              </h1>
            </div>
            <Link href="/" className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
              <Upload size={14} /> Nouveau
            </Link>
          </div>
 
          {/* Filters */}
          <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="input-field pl-8 py-2"
                placeholder="Rechercher un fichier..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'expired'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === s ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  style={statusFilter === s ? { background: 'linear-gradient(135deg,#C9972A,#E4B84A)' } : {}}
                >
                  {s === 'all' ? 'Tous' : s === 'active' ? 'Actifs' : 'Expirés'}
                </button>
              ))}
            </div>
          </div>
 
          {/* Table */}
          <div className="card overflow-hidden">
            {loadingData ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-gray-400">Chargement des transferts…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Upload size={32} className="text-gray-200 mx-auto mb-3" strokeWidth={1} />
                <p className="text-gray-400 text-sm">
                  {search || statusFilter !== 'all'
                    ? 'Aucun résultat pour ces filtres'
                    : "Vous n'avez pas encore créé de transfert"}
                </p>
                {!search && statusFilter === 'all' && (
                  <Link href="/" className="btn-gold inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm mt-4">
                    <Upload size={13} /> Créer un transfert
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {/* Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  <div className="col-span-5">Fichiers</div>
                  <div className="col-span-2">Taille</div>
                  <div className="col-span-2">Expire</div>
                  <div className="col-span-1">DL</div>
                  <div className="col-span-2">Actions</div>
                </div>
 
                {filtered.map((t: any) => {
                  const now = new Date()
                  const expired = t.expiresAt <= now || t.status === 'expired'
                  const daysLeft = Math.max(0, Math.ceil((t.expiresAt.getTime() - now.getTime()) / 86400000))
                  const displayDate = t.createdAt.getTime() > 0
                    ? format(t.createdAt, 'd MMM yyyy', { locale: fr })
                    : '—'
 
                  return (
                    <div
                      key={t.id}
                      className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition-colors ${expired ? 'opacity-60' : ''}`}
                    >
                      {/* Files */}
                      <div className="md:col-span-5 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${expired ? 'bg-gray-100' : 'bg-yellow-50'}`}>
                          <FileText size={14} style={{ color: expired ? '#A3A3A3' : '#C9972A' }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {t.files?.[0]?.name || 'Transfert'}
                            {t.files?.length > 1 && (
                              <span className="text-gray-400 font-normal"> +{t.files.length - 1}</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">{displayDate}</p>
                        </div>
                      </div>
 
                      {/* Size */}
                      <div className="md:col-span-2 text-sm text-gray-600">
                        {formatBytes(t.totalSize || 0)}
                      </div>
 
                      {/* Expiry */}
                      <div className="md:col-span-2">
                        {expired ? (
                          <span className="text-xs text-red-400 flex items-center gap-1">
                            <Clock size={11} /> Expiré
                          </span>
                        ) : (
                          <span className={`text-xs flex items-center gap-1 ${daysLeft <= 1 ? 'text-orange-500' : 'text-gray-500'}`}>
                            <Clock size={11} />
                            {daysLeft === 0 ? 'Auj.' : `${daysLeft}j`}
                          </span>
                        )}
                      </div>
 
                      {/* Downloads */}
                      <div className="md:col-span-1 text-sm text-gray-600 flex items-center gap-1">
                        <Download size={12} className="text-gray-400" />
                        {t.downloadCount || 0}
                      </div>
 
                      {/* Actions */}
                      <div className="md:col-span-2 flex items-center gap-2">
                        {!expired && (
                          <>
                            <button
                              onClick={() => copyLink(t.shareId)}
                              title="Copier le lien"
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              {copiedId === t.shareId
                                ? <CheckCircle size={14} className="text-green-500" />
                                : <Copy size={14} className="text-gray-400" />}
                            </button>
                            <Link
                              href={`/d/${t.shareId}`}
                              target="_blank"
                              title="Ouvrir"
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <ExternalLink size={14} className="text-gray-400" />
                            </Link>
                          </>
                        )}
                        <button
                          onClick={() => deleteTransfer(t)}
                          disabled={deletingId === t.id}
                          title="Supprimer"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
 
          {/* Count */}
          {!loadingData && filtered.length > 0 && (
            <p className="text-xs text-gray-400 text-center mt-4">
              {filtered.length} transfert{filtered.length > 1 ? 's' : ''}
              {statusFilter !== 'all' || search ? ' correspondant aux filtres' : ' au total'}
            </p>
          )}
        </div>
      </div>
    </>
  )
}