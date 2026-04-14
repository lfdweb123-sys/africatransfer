import Head from 'next/head'
import Link from 'next/link'
import { Upload, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Head><title>Page introuvable — AfricaTransfer</title></Head>
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#FAFAFA' }}>
        <div className="text-center animate-slide-up">
          <p className="text-8xl font-bold mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#E5E5E5' }}>404</p>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Page introuvable</h1>
          <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
            La page que vous cherchez n'existe pas ou a été déplacée.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/"
              className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm">
              <Upload size={14} />
              Envoyer des fichiers
            </Link>
            <button onClick={() => window.history.back()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <ArrowLeft size={14} />
              Retour
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
