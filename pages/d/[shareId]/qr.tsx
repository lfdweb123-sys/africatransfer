import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Download, Copy, CheckCircle, ArrowLeft } from 'lucide-react'
import QRCode from 'qrcode'

export default function QRPage() {
  const router = useRouter()
  const { shareId } = router.query
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)
  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/d/${shareId}` : ''

  useEffect(() => {
    if (!shareId || !canvasRef.current) return
    const url = `${window.location.origin}/d/${shareId}`
    QRCode.toCanvas(canvasRef.current, url, {
      width: 280,
      margin: 2,
      color: { dark: '#0A0A0A', light: '#FFFFFF' },
    })
  }, [shareId])

  async function downloadQR() {
    if (!canvasRef.current) return
    const url = canvasRef.current.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `africatransfer-${shareId}.png`
    a.click()
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <>
      <Head><title>QR Code — AfricaTransfer</title></Head>
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm animate-slide-up">
          <Link href={`/d/${shareId}`}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-8 transition-colors">
            <ArrowLeft size={14} />
            Retour au téléchargement
          </Link>

          <div className="card p-8 text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">QR Code de partage</h1>
            <p className="text-sm text-gray-400 mb-6">Scannez ce code pour accéder aux fichiers</p>

            {/* QR */}
            <div className="inline-block p-4 bg-white border border-gray-200 rounded-2xl mb-6 shadow-sm">
              <canvas ref={canvasRef} className="rounded-lg" />
            </div>

            {/* Link */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 flex items-center gap-2">
              <p className="flex-1 text-xs text-gray-600 truncate font-mono">{shareLink}</p>
              <button onClick={copyLink}
                className={`p-1.5 rounded-lg transition-all ${copied ? 'text-green-600' : 'text-gray-400 hover:text-yellow-600'}`}>
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <button onClick={downloadQR}
              className="btn-gold w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
              <Download size={16} />
              Télécharger le QR Code
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            <Link href="/" style={{ color: '#C9972A' }} className="hover:underline">AfricaTransfer</Link>
            {' '}— Partage de fichiers en Afrique
          </p>
        </div>
      </div>
    </>
  )
}
