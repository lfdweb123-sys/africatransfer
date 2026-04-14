import { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import {
  Send, Link2, Mail, Lock, ChevronDown, ChevronUp,
  CheckCircle, Copy, Share2, QrCode, Eye, EyeOff,
  AlertCircle, Loader2, X
} from 'lucide-react'
import UploadZone from './UploadZone'
import { useAuth } from '../lib/auth-context'
import { PLANS, formatBytes } from '../lib/types'
import toast from 'react-hot-toast'

type Mode = 'send' | 'link'

interface UploadProgress {
  current: number
  total: number
  percent: number
  fileName: string
  phase: 'uploading' | 'processing' | 'done'
}

export default function TransferForm() {
  const { user, userData } = useAuth()
  const router = useRouter()
  const plan = userData?.plan || 'free'
  const planConfig = PLANS[plan]

  const [mode, setMode] = useState<Mode>('link')
  const [files, setFiles] = useState<File[]>([])
  const [senderName, setSenderName] = useState(userData?.displayName || '')
  const [senderEmail, setSenderEmail] = useState(user?.email || '')
  const [recipientEmails, setRecipientEmails] = useState('')
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [result, setResult] = useState<{ shareLink: string; shareId: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const CHUNK_SIZE = 512 * 1024 // 512KB (plus petit pour Vercel)

  async function uploadFileInChunks(file: File, transferId: string, fileIndex: number): Promise<void> {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    console.log(`[Upload] Starting upload for ${file.name}, ${totalChunks} chunks of ${CHUNK_SIZE} bytes`)

    // Init upload
    console.log(`[Upload] Init request for ${file.name}`)
    const initRes = await fetch('/api/upload/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transferId,
        fileIndex,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        totalChunks,
      }),
    })

    if (!initRes.ok) {
      const errorText = await initRes.text()
      console.error(`[Upload] Init failed for ${file.name}:`, initRes.status, errorText)
      throw new Error(`Init failed: ${initRes.status}`)
    }

    const { uploadId } = await initRes.json()
    console.log(`[Upload] Init success for ${file.name}, uploadId: ${uploadId}`)

    // Upload chunks
    for (let i = 0; i < totalChunks; i++) {
      if (abortRef.current?.signal.aborted) {
        console.log(`[Upload] Cancelled during chunk ${i} of ${file.name}`)
        throw new Error('Cancelled')
      }

      const start = i * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const chunk = file.slice(start, end)

      const formData = new FormData()
      formData.append('chunk', chunk)
      formData.append('uploadId', uploadId)
      formData.append('chunkIndex', String(i))
      formData.append('totalChunks', String(totalChunks))
      formData.append('fileName', file.name)
      formData.append('fileType', file.type)
      formData.append('fileSize', String(file.size))
      formData.append('transferId', transferId)
      formData.append('fileIndex', String(fileIndex))

      console.log(`[Upload] Uploading chunk ${i + 1}/${totalChunks} for ${file.name}, size: ${chunk.size} bytes`)

      const chunkRes = await fetch('/api/upload/chunk', {
        method: 'POST',
        body: formData,
        signal: abortRef.current?.signal,
      })

      if (!chunkRes.ok) {
        const errorText = await chunkRes.text()
        console.error(`[Upload] Chunk ${i} failed for ${file.name}:`, chunkRes.status, errorText)
        throw new Error(`Chunk ${i} failed: ${chunkRes.status}`)
      }

      console.log(`[Upload] Chunk ${i + 1}/${totalChunks} uploaded for ${file.name}`)

      // Update progress
      const currentTotal = files.reduce((acc, f, idx) => {
        if (idx < fileIndex) return acc + Math.ceil(f.size / CHUNK_SIZE)
        if (idx === fileIndex) return acc + i + 1
        return acc
      }, 0)
      const grandTotal = files.reduce((acc, f) => acc + Math.ceil(f.size / CHUNK_SIZE), 0)
      
      setProgress({
        current: currentTotal,
        total: grandTotal,
        percent: Math.round((currentTotal / grandTotal) * 100),
        fileName: file.name,
        phase: 'uploading'
      })
    }

    // Complete upload
    console.log(`[Upload] Complete request for ${file.name}`)
    const completeRes = await fetch('/api/upload/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId, transferId, fileIndex }),
    })

    if (!completeRes.ok) {
      const errorText = await completeRes.text()
      console.error(`[Upload] Complete failed for ${file.name}:`, completeRes.status, errorText)
      throw new Error(`Complete failed: ${completeRes.status}`)
    }

    console.log(`[Upload] Complete success for ${file.name}`)
  }

  async function handleSubmit() {
    if (files.length === 0) {
      toast.error('Ajoutez au moins un fichier')
      return
    }
    if (!senderName.trim()) {
      toast.error('Indiquez votre nom')
      return
    }
    if (!senderEmail.trim()) {
      toast.error('Indiquez votre email')
      return
    }

    setSubmitting(true)
    abortRef.current = new AbortController()

    const totalChunks = files.reduce((acc, f) => acc + Math.ceil(f.size / CHUNK_SIZE), 0)
    setProgress({ current: 0, total: totalChunks, percent: 0, fileName: files[0].name, phase: 'uploading' })

    try {
      // Create transfer record first
      console.log('[Transfer] Creating transfer record...')
      const initRes = await fetch('/api/transfers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: senderName.trim(),
          senderEmail: senderEmail.trim(),
          message: message.trim(),
          password: password.trim(),
          plan,
          recipientEmails: mode === 'send'
            ? recipientEmails.split(',').map(e => e.trim()).filter(Boolean)
            : [],
          filesMeta: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
          userId: user?.uid || null,
        }),
      })

      if (!initRes.ok) {
        const err = await initRes.json()
        console.error('[Transfer] Create failed:', err)
        throw new Error(err.message || 'Erreur de création du transfert')
      }

      const { transferId } = await initRes.json()
      console.log('[Transfer] Transfer created:', transferId)

      // Upload all files
      for (let i = 0; i < files.length; i++) {
        console.log(`[Transfer] Uploading file ${i + 1}/${files.length}: ${files[i].name}`)
        await uploadFileInChunks(files[i], transferId, i)
      }

      // Finalize transfer
      console.log('[Transfer] Finalizing transfer...')
      setProgress(prev => prev ? { ...prev, phase: 'processing', percent: 99 } : null)
      
      const finalRes = await fetch('/api/transfers/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferId, mode }),
      })

      if (!finalRes.ok) {
        const error = await finalRes.json()
        console.error('[Transfer] Finalize failed:', error)
        throw new Error(error.message || 'Erreur de finalisation')
      }
      
      const { shareId, shareLink } = await finalRes.json()
      console.log('[Transfer] Finalized! Share link:', shareLink)

      setProgress(prev => prev ? { ...prev, phase: 'done', percent: 100 } : null)
      setTimeout(() => {
        setProgress(null)
        setResult({ shareLink, shareId })
      }, 500)

    } catch (err: any) {
      console.error('[Transfer] Error:', err)
      if (err.message !== 'Cancelled') {
        toast.error(err.message || 'Une erreur est survenue')
      }
      setProgress(null)
    } finally {
      setSubmitting(false)
    }
  }

  async function copyLink() {
    if (!result) return
    await navigator.clipboard.writeText(result.shareLink)
    setCopied(true)
    toast.success('Lien copié !')
    setTimeout(() => setCopied(false), 3000)
  }

  function reset() {
    setFiles([])
    setRecipientEmails('')
    setMessage('')
    setPassword('')
    setResult(null)
    setProgress(null)
    setCopied(false)
  }

  // --- SUCCESS STATE ---
  if (result) {
    return (
      <div className="card p-8 text-center animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Transfert prêt !</h2>
        <p className="text-gray-500 mb-8">
          Partagez ce lien pour permettre le téléchargement de vos fichiers.
        </p>

        {/* Link box */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Link2 size={16} className="text-yellow-600 flex-shrink-0" />
          <span className="flex-1 text-sm text-gray-700 truncate font-mono">{result.shareLink}</span>
          <button onClick={copyLink}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              copied ? 'bg-green-100 text-green-700' : 'btn-gold'
            }`}>
            {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
            {copied ? 'Copié' : 'Copier'}
          </button>
        </div>

        <div className="flex gap-3 justify-center mb-8">
          <button
            onClick={() => { const url = `https://wa.me/?text=${encodeURIComponent('Téléchargez mes fichiers : ' + result.shareLink)}`; window.open(url, '_blank') }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-all"
          >
            <Share2 size={14} />
            WhatsApp
          </button>
          <button
            onClick={() => router.push(`/d/${result.shareId}/qr`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-yellow-300 hover:text-yellow-700 hover:bg-yellow-50 transition-all"
          >
            <QrCode size={14} />
            QR Code
          </button>
        </div>

        <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline">
          Envoyer d'autres fichiers
        </button>
      </div>
    )
  }

  // --- PROGRESS STATE ---
  if (progress) {
    return (
      <div className="card p-8 animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full border-4 border-yellow-100 border-t-yellow-500 animate-spin mx-auto mb-4" />
          <p className="font-medium text-gray-900">
            {progress.phase === 'processing' ? 'Finalisation...' : `Envoi en cours...`}
          </p>
          {progress.phase === 'uploading' && (
            <p className="text-sm text-gray-400 mt-1 truncate max-w-xs mx-auto">{progress.fileName}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>{progress.percent}%</span>
            <span>{progress.current} / {progress.total} parties</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full progress-bar rounded-full transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => { abortRef.current?.abort(); setProgress(null); setSubmitting(false) }}
          className="mt-6 w-full text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
        >
          <X size={14} /> Annuler
        </button>
      </div>
    )
  }

  // --- FORM STATE ---
  return (
    <div className="card animate-fade-in">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setMode('link')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all border-b-2 -mb-px ${
            mode === 'link'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Link2 size={16} />
          Créer un lien
        </button>
        <button
          onClick={() => setMode('send')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all border-b-2 -mb-px ${
            mode === 'send'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Send size={16} />
          Envoyer par email
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Upload zone */}
        <UploadZone
          files={files}
          onFilesChange={setFiles}
          maxSize={planConfig.maxFileSize}
          maxTotal={planConfig.maxTransferSize}
        />

        {/* Sender info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Votre nom</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ex : Kofi Mensah"
              value={senderName}
              onChange={e => setSenderName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Votre email</label>
            <input
              type="email"
              className="input-field"
              placeholder="vous@exemple.com"
              value={senderEmail}
              onChange={e => setSenderEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Recipient (send mode only) */}
        {mode === 'send' && (
          <div className="animate-slide-up">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Email(s) des destinataires
              <span className="text-gray-400 font-normal ml-1">(séparés par des virgules)</span>
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="ami@exemple.com, collègue@exemple.com"
              value={recipientEmails}
              onChange={e => setRecipientEmails(e.target.value)}
            />
          </div>
        )}

        {/* Message */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Message <span className="text-gray-400 font-normal">(facultatif)</span>
          </label>
          <textarea
            className="input-field resize-none"
            placeholder="Ajoutez un message pour le destinataire..."
            rows={3}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>

        {/* Advanced options */}
        <div>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Options avancées
          </button>

          {showOptions && (
            <div className="mt-3 space-y-3 animate-slide-up">
              {/* Password protection */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  <Lock size={12} className="inline mr-1" />
                  Mot de passe de protection <span className="text-gray-400 font-normal">(facultatif)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Mot de passe pour protéger le lien"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Expiry info */}
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <AlertCircle size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-500">
                  {plan === 'free'
                    ? 'Plan gratuit : vos fichiers seront disponibles pendant 7 jours.'
                    : 'Plan Premium : vos fichiers seront disponibles pendant 1 an.'}
                  {plan === 'free' && (
                    <a href="/pricing" className="text-yellow-600 ml-1 hover:underline">Passer Premium →</a>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || files.length === 0}
          className="btn-gold w-full py-3.5 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {submitting ? (
            <><Loader2 size={18} className="animate-spin" /> Envoi en cours...</>
          ) : (
            <><Send size={18} /> {mode === 'link' ? 'Créer le lien de partage' : 'Envoyer les fichiers'}</>
          )}
        </button>

        {/* No account note */}
        {!user && (
          <p className="text-center text-xs text-gray-400">
            Aucun compte requis. <a href="/auth/register" className="text-yellow-600 hover:underline">Créez un compte</a> pour suivre vos transferts.
          </p>
        )}
      </div>
    </div>
  )
}