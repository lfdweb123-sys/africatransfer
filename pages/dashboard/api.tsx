// pages/dashboard/api.tsx - Version corrigée
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../lib/auth-context'
import Navbar from '../../components/Navbar'
import Link from 'next/link'
import {
  Key, Plus, Trash2, Copy, CheckCircle, Eye, EyeOff,
  AlertCircle, Lock, ExternalLink, Loader2, Star
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function ApiPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [keys, setKeys] = useState<any[]>([])
  const [loadingKeys, setLoadingKeys] = useState(true)
  const [creating, setCreating] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login?redirect=/dashboard/api')
  }, [user, loading, router])

  useEffect(() => {
    if (user && userData?.plan === 'premium') {
      fetchKeys()
    } else if (user && userData) {
      setLoadingKeys(false)
    }
  }, [user, userData])

  async function fetchKeys() {
    setLoadingKeys(true)
    try {
      const token = await user!.getIdToken()
      const res = await fetch('/api/v1/keys', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      // Si l'API n'existe pas encore ou erreur 404, on affiche juste aucune clé
      if (res.status === 404) {
        setKeys([])
        return
      }
      
      const data = await res.json()
      setKeys(data.keys || [])
    } catch (e) {
      // En cas d'erreur, on affiche juste aucune clé sans message d'erreur
      console.log('API non disponible ou aucune clé trouvée')
      setKeys([])
    } finally {
      setLoadingKeys(false)
    }
  }

  async function createKey() {
    if (!keyName.trim()) { toast.error('Donnez un nom à votre clé'); return }
    setCreating(true)
    try {
      const token = await user!.getIdToken()
      const res = await fetch('/api/v1/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: keyName }),
      })
      
      if (res.status === 404) {
        toast.error('API non disponible. Veuillez réessayer plus tard.')
        return
      }
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNewKey(data.apiKey.key)
      setKeyName('')
      fetchKeys()
      toast.success('Clé créée !')
    } catch (err: any) {
      toast.error(err.message || 'Erreur création clé')
    } finally {
      setCreating(false)
    }
  }

  async function revokeKey(keyId: string) {
    if (!confirm('Révoquer cette clé ? Elle ne fonctionnera plus immédiatement.')) return
    try {
      const token = await user!.getIdToken()
      const res = await fetch(`/api/v1/keys?keyId=${keyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (res.status === 404) {
        toast.error('API non disponible')
        return
      }
      
      toast.success('Clé révoquée')
      fetchKeys()
    } catch {
      toast.error('Erreur révocation')
    }
  }

  async function copyKey(key: string) {
    await navigator.clipboard.writeText(key)
    setCopiedKey(true)
    toast.success('Clé copiée !')
    setTimeout(() => setCopiedKey(false), 3000)
  }

  if (loading || !user) return null

  return (
    <>
      <Head><title>API — AfricaTransfer</title></Head>
      <Navbar />
      <div className="pt-16 min-h-screen" style={{ background: '#FAFAFA' }}>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="mb-8">
            <p className="text-sm text-gray-400 mb-1">Tableau de bord</p>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: 'Cormorant Garamond, serif' }}>API & Clés</h1>
          </div>

          {/* Plan check */}
{userData?.plan !== 'premium' ? (
  <div className="card p-8 text-center">
    <Lock size={40} className="text-gray-200 mx-auto mb-4" strokeWidth={1} />
    <h2 className="font-semibold text-gray-900 mb-2">API réservée aux membres Premium</h2>
    <p className="text-sm text-gray-500 mb-6">
      L'accès à l'API publique et à l'extension Chrome nécessite un plan Premium.
    </p>
    <Link href="/pricing" className="btn-gold px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2">
      <Star size={14} /> Passer Premium
    </Link>
  </div>
) : (
  <div className="space-y-6">

    {/* Download Desktop App */}
    <div className="card p-6 border border-gray-200 bg-white">
      <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <ExternalLink size={16} style={{ color: '#C9972A' }} />
        Application Desktop AfricaTransfer
      </h2>

      <p className="text-sm text-gray-500 mb-4">
        Téléchargez le logiciel officiel AfricaTransfer pour Windows.
      </p>

      <a
        href="https://drive.google.com/file/d/1GbW4aDuWpSXOv-mLtZ-j6Ub22vISlwLp/view?usp=drive_link"
        className="btn-gold px-5 py-3 rounded-xl text-sm inline-flex items-center gap-2"
      >
        <ExternalLink size={14} />
        Télécharger l’application
      </a>

      <p className="text-xs text-gray-400 mt-3">
        Version sécurisée • Windows 10/11
      </p>
    </div>

              {/* Nouvelle clé affichée une seule fois */}
              {newKey && (
                <div className="card p-6 border-green-200 bg-green-50 animate-slide-up">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={18} className="text-green-500" />
                    <p className="font-semibold text-green-800">Clé créée — copiez-la maintenant !</p>
                  </div>
                  <p className="text-xs text-green-700 mb-3">
                    Cette clé ne sera affichée qu'une seule fois. Conservez-la en lieu sûr.
                  </p>
                  <div className="flex items-center gap-2 bg-white border border-green-200 rounded-xl p-3">
                    <code className="flex-1 text-xs font-mono text-gray-800 break-all">{newKey}</code>
                    <button onClick={() => copyKey(newKey)}
                      className={`p-2 rounded-lg transition-all ${copiedKey ? 'text-green-600' : 'text-gray-400 hover:text-yellow-600'}`}>
                      {copiedKey ? <CheckCircle size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <button onClick={() => setNewKey(null)} className="mt-3 text-xs text-green-700 hover:underline">
                    J'ai copié ma clé, fermer
                  </button>
                </div>
              )}

              {/* Créer une clé */}
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus size={16} style={{ color: '#C9972A' }} />
                  Créer une clé API
                </h2>
                <div className="flex gap-3">
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="Nom de la clé (ex: Extension Chrome, Site web...)"
                    value={keyName}
                    onChange={e => setKeyName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && createKey()}
                  />
                  <button onClick={createKey} disabled={creating}
                    className="btn-gold px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                    {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Créer
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Maximum 3 clés actives. La clé est affichée une seule fois à la création.</p>
              </div>

              {/* Liste des clés */}
              <div className="card overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Key size={16} style={{ color: '#C9972A' }} />
                    Vos clés API ({keys.length}/3)
                  </h2>
                </div>

                {loadingKeys ? (
                  <div className="p-8 text-center">
                    <Loader2 size={24} className="animate-spin mx-auto" style={{ color: '#C9972A' }} />
                  </div>
                ) : keys.length === 0 ? (
                  <div className="p-8 text-center">
                    <Key size={32} className="text-gray-200 mx-auto mb-3" strokeWidth={1} />
                    <p className="text-sm text-gray-400">Aucune clé API. Créez-en une pour commencer.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {keys.map((k: any) => (
                      <div key={k.id} className="p-5 flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                          <Key size={16} style={{ color: '#C9972A' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{k.name}</p>
                          <p className="text-xs font-mono text-gray-400 mt-0.5">{k.keyPreview}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Créée le {k.createdAt ? format(new Date(k.createdAt), 'd MMM yyyy', { locale: fr }) : '—'}
                            {k.lastUsedAt && ` · Dernière utilisation : ${format(new Date(k.lastUsedAt), 'd MMM yyyy', { locale: fr })}`}
                            {' · '}{k.usageCount} appel{k.usageCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${k.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {k.active ? 'Active' : 'Révoquée'}
                        </span>
                        {k.active && (
                          <button onClick={() => revokeKey(k.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Documentation */}
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Documentation de l'API</h2>
                <div className="space-y-4 text-sm">

                  <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                    <p className="text-gray-400 mb-2"># Lister vos transferts</p>
                    <p className="text-green-400">GET https://africatransfer-b12m.vercel.app/api/v1/transfers</p>
                    <p className="text-yellow-400 mt-1">x-api-key: at_live_votre_cle</p>
                  </div>

                  <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                    <p className="text-gray-400 mb-2"># Filtrer par statut</p>
                    <p className="text-green-400">GET /api/v1/transfers?status=active&limit=10</p>
                    <p className="text-yellow-400 mt-1">x-api-key: at_live_votre_cle</p>
                  </div>

                  <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                    <p className="text-gray-400 mb-2"># Supprimer un transfert</p>
                    <p className="text-red-400">DELETE /api/v1/transfers?shareId=ABC123</p>
                    <p className="text-yellow-400 mt-1">x-api-key: at_live_votre_cle</p>
                  </div>

                  <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                    <p className="text-gray-400 mb-2"># Réponse exemple</p>
                    <p className="text-gray-100">{`{`}</p>
                    <p className="text-gray-100 ml-4">{`"ok": true,`}</p>
                    <p className="text-gray-100 ml-4">{`"count": 2,`}</p>
                    <p className="text-gray-100 ml-4">{`"transfers": [`}</p>
                    <p className="text-gray-100 ml-8">{`{ "shareId": "ABC123", "shareLink": "...", "files": [...] }`}</p>
                    <p className="text-gray-100 ml-4">{`]`}</p>
                    <p className="text-gray-100">{`}`}</p>
                  </div>
                </div>
              </div>

              {/* Extension Chrome */}
              <div className="card p-6" style={{ background: 'linear-gradient(135deg, #0A0A0A, #1A1A1A)', border: '1px solid #C9972A' }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #C9972A, #E4B84A)' }}>
                    <ExternalLink size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Extension Chrome AfricaTransfer</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Envoyez des fichiers directement depuis votre navigateur. Utilisez votre clé API pour l'authentification.
                    </p>
                    <div className="flex gap-3">
                      <a href="#" className="btn-gold px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2">
                        <ExternalLink size={14} />
                        Installer l'extension
                      </a>
                      <a href="#" className="px-4 py-2 rounded-lg text-sm border border-gray-700 text-gray-400 hover:border-yellow-600 hover:text-yellow-500 transition-all inline-flex items-center gap-2">
                        Guide d'installation
                      </a>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  )
}
