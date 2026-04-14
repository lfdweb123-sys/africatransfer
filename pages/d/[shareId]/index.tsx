// pages/d/[shareId].tsx - Version corrigée (sans Storage)
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { adminDb } from '../../../lib/firebase-admin'
import { formatBytes, getFileIcon, Transfer } from '../../../lib/types'
import {
  Download, Lock, FileText, Image, Video, Music,
  Archive, File, Clock, Shield, CheckCircle, AlertTriangle,
  Eye, EyeOff, Loader2, Share2, QrCode
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface Props {
  transfer: Transfer | null
  expired: boolean
  needsPassword: boolean
  shareId: string
}

function FileIconComponent({ type }: { type: string }) {
  const iconType = getFileIcon(type)
  const props = { size: 20, strokeWidth: 1.5 }
  switch (iconType) {
    case 'image': return <Image {...props} style={{ color: '#C9972A' }} />
    case 'video': return <Video {...props} style={{ color: '#8B5CF6' }} />
    case 'music': return <Music {...props} style={{ color: '#10B981' }} />
    case 'file-text': return <FileText {...props} style={{ color: '#3B82F6' }} />
    case 'archive': return <Archive {...props} style={{ color: '#F59E0B' }} />
    default: return <File {...props} className="text-gray-400" />
  }
}

export default function DownloadPage({ transfer, expired, needsPassword, shareId }: Props) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [unlocked, setUnlocked] = useState(!needsPassword)
  const [passwordError, setPasswordError] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [allDownloaded, setAllDownloaded] = useState(false)

  async function verifyPassword(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/transfers/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shareId, password }),
    })
    if (res.ok) {
      setUnlocked(true)
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  async function downloadFile(file: any, index: number) {
    setDownloading(file.id)
    try {
      const response = await fetch('/api/transfers/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId, fileId: file.id }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors du téléchargement')
      }
      
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        const { url, fileName } = await response.json()
        const fileResponse = await fetch(url)
        const blob = await fileResponse.blob()
        const blobUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(blobUrl)
      } else {
        const blob = await response.blob()
        const blobUrl = window.URL.createObjectURL(blob)
        
        const contentDisposition = response.headers.get('content-disposition')
        let fileName = file.name
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+?)"/)
          if (match) fileName = decodeURIComponent(match[1])
        }
        
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(blobUrl)
      }
      
      toast.success('Fichier téléchargé avec succès !')
    } catch (error: any) {
      console.error('Download error:', error)
      toast.error(error.message || 'Erreur lors du téléchargement')
    } finally {
      setDownloading(null)
    }
  }

  async function downloadAll() {
    if (!transfer) return
    toast.loading('Préparation du téléchargement...', { id: 'download-all' })
    
    for (let i = 0; i < transfer.files.length; i++) {
      const file = transfer.files[i]
      toast.loading(`Téléchargement de ${file.name}... (${i + 1}/${transfer.files.length})`, { id: 'download-all' })
      await downloadFile(file, i)
      if (i < transfer.files.length - 1) {
        await new Promise(r => setTimeout(r, 1000))
      }
    }
    
    toast.success('Tous les fichiers ont été téléchargés !', { id: 'download-all' })
    setAllDownloaded(true)
  }

  if (expired) {
    return (
      <>
        <Head><title>Lien expiré — AfricaTransfer</title></Head>
        <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
          <div className="max-w-md w-full text-center card p-10 animate-slide-up">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={28} className="text-red-400" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Ce lien a expiré</h1>
            <p className="text-sm text-gray-500 mb-8">
              Les fichiers ont été automatiquement supprimés. Demandez à l'expéditeur de renvoyer les fichiers.
            </p>
            <Link href="/" className="btn-gold px-6 py-3 rounded-xl text-sm font-medium inline-block">
              Envoyer mes fichiers
            </Link>
          </div>
        </div>
      </>
    )
  }

  if (!transfer) {
    return (
      <>
        <Head><title>Lien introuvable — AfricaTransfer</title></Head>
        <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
          <div className="max-w-md w-full text-center card p-10">
            <AlertTriangle size={40} className="text-gray-300 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Lien introuvable</h1>
            <p className="text-sm text-gray-500 mb-6">Ce lien de partage n'existe pas ou a été supprimé.</p>
            <Link href="/" className="btn-gold px-6 py-3 rounded-xl text-sm font-medium inline-block">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </>
    )
  }

  const expiresAt = new Date(transfer.expiresAt)
  const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <>
      <Head>
        <title>Téléchargement — AfricaTransfer</title>
        <meta name="description" content={`${transfer.files.length} fichier(s) partagé(s) par ${transfer.senderName || 'un utilisateur'}`} />
      </Head>

      <div className="min-h-screen" style={{ background: '#FAFAFA' }}>
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#C9972A,#E4B84A)' }}>
                <Download size={14} className="text-white" />
              </div>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px' }}>
                Africa<span style={{ color: '#C9972A' }}>Transfer</span>
              </span>
            </Link>
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Envoyer vos fichiers →
            </Link>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-12">
          {!unlocked ? (
            <div className="card p-8 animate-slide-up">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center mx-auto mb-4">
                  <Lock size={24} style={{ color: '#C9972A' }} />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">Fichiers protégés</h1>
                <p className="text-sm text-gray-500">Entrez le mot de passe pour accéder aux fichiers.</p>
              </div>

              <form onSubmit={verifyPassword} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input-field pr-10"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setPasswordError(false) }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-500 animate-fade-in">Mot de passe incorrect.</p>
                )}
                <button type="submit" className="btn-gold w-full py-3 rounded-xl font-medium">
                  Déverrouiller
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6 animate-slide-up">
              <div className="card p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">
                      Envoyé par <strong className="text-gray-700">{transfer.senderName || 'Anonyme'}</strong>
                    </p>
                    <h1 className="text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                      {transfer.files.length} fichier{transfer.files.length > 1 ? 's' : ''} à télécharger
                    </h1>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">Taille totale</p>
                    <p className="font-semibold text-gray-900">{formatBytes(transfer.totalSize)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock size={12} style={{ color: '#C9972A' }} />
                    Expire {daysLeft <= 1 ? "aujourd'hui" : `dans ${daysLeft} jours`} ({format(expiresAt, 'd MMM yyyy', { locale: fr })})
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Shield size={12} style={{ color: '#C9972A' }} />
                    Lien sécurisé
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Download size={12} style={{ color: '#C9972A' }} />
                    {transfer.downloadCount} téléchargement{transfer.downloadCount !== 1 ? 's' : ''}
                  </div>
                </div>

                {transfer.message && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                    <p className="text-sm text-gray-700 italic">"{transfer.message}"</p>
                  </div>
                )}
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-medium text-gray-900">Fichiers</h2>
                  {transfer.files.length > 1 && (
                    <button onClick={downloadAll}
                      className="btn-gold flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
                      <Download size={14} />
                      Tout télécharger
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {transfer.files.map((file: any, i: number) => (
                    <div key={i} className="file-item group">
                      <FileIconComponent type={file.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                      </div>
                      <button
                        onClick={() => downloadFile(file, i)}
                        disabled={downloading === file.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-gray-100 hover:bg-yellow-50 hover:text-yellow-700 text-gray-600 disabled:opacity-50"
                      >
                        {downloading === file.id
                          ? <Loader2 size={12} className="animate-spin" />
                          : <Download size={12} />}
                        Télécharger
                      </button>
                    </div>
                  ))}
                </div>

                {allDownloaded && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                    <CheckCircle size={14} className="text-green-500" />
                    <p className="text-sm text-green-700">Tous les fichiers ont été téléchargés !</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigator.share?.({ title: 'AfricaTransfer', url: window.location.href }).catch(() => {})}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  <Share2 size={14} />
                  Partager
                </button>
                <Link href={`/d/${shareId}/qr`}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all">
                  <QrCode size={14} />
                  QR Code
                </Link>
              </div>

              <div className="text-center py-4">
                <p className="text-sm text-gray-400 mb-3">Vous souhaitez envoyer vos propres fichiers ?</p>
                <Link href="/" className="btn-gold px-6 py-2.5 rounded-xl text-sm font-medium inline-block">
                  Envoyer gratuitement
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const shareId = params?.shareId as string

  try {
    const snapshot = await adminDb
      .collection('transfers')
      .where('shareId', '==', shareId)
      .where('status', '==', 'active')
      .limit(1)
      .get()

    if (snapshot.empty) {
      return { props: { transfer: null, expired: false, needsPassword: false, shareId } }
    }

    const doc  = snapshot.docs[0]
    const data = doc.data()

    // Vérifier expiration
    const expiresAt = data.expiresAt.toDate()
    if (expiresAt < new Date()) {
      await doc.ref.update({ status: 'expired' })
      return { props: { transfer: null, expired: true, needsPassword: false, shareId } }
    }

    const needsPassword = !!data.passwordHash

    // ✅ Lire les métadonnées des fichiers depuis la sous-collection "files"
    // (pas de bufferBase64 ici → pas de dépassement 1MB)
    const filesSnap = await doc.ref
      .collection('files')
      .orderBy('fileIndex')
      .get()

    const files = filesSnap.docs.map(fileDoc => {
      const f = fileDoc.data()
      return {
        id:         f.id,
        name:       f.name,
        size:       f.size,
        type:       f.type,
        fileIndex:  f.fileIndex,
        sha256:     f.sha256   || null,
        uploadedAt: f.uploadedAt?.toDate?.()?.toISOString() || null,
      }
    })

    const transfer = {
      id:            doc.id,
      shareId:       data.shareId,
      senderName:    data.senderName    || null,
      senderEmail:   data.senderEmail   || null,
      message:       data.message       || null,
      totalSize:     data.totalSize     || 0,
      downloadCount: data.downloadCount || 0,
      expiresAt:     expiresAt.toISOString(),
      createdAt:     data.createdAt.toDate().toISOString(),
      files,
    }

    return {
      props: {
        transfer,
        expired: false,
        needsPassword,
        shareId,
      },
    }
  } catch (error) {
    console.error('[ShareId] getServerSideProps error:', error)
    return { props: { transfer: null, expired: false, needsPassword: false, shareId } }
  }
}