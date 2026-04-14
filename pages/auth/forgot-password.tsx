import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '../../lib/auth-context'
import { Upload, Loader2, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)

      // ✅ Email de notification via Brevo (non bloquant)
      fetch('/api/auth/reset-password-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(e => console.error('[ResetNotify]', e))

    } catch (err: any) {
      console.error('[ForgotPassword] Erreur:', err.code, err.message)
      // Messages d'erreur précis selon le code Firebase
      const msg =
        err.code === 'auth/user-not-found'
          ? 'Aucun compte trouvé avec cet email.'
          : err.code === 'auth/invalid-email'
          ? 'Adresse email invalide.'
          : err.code === 'auth/too-many-requests'
          ? 'Trop de tentatives. Attendez quelques minutes.'
          : err.code === 'auth/network-request-failed'
          ? 'Erreur réseau. Vérifiez votre connexion.'
          : `Erreur : ${err.code || err.message}`
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head><title>Mot de passe oublié — AfricaTransfer</title></Head>
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#FAFAFA' }}>
        <div className="w-full max-w-md animate-slide-up">
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#C9972A,#E4B84A)' }}>
              <Upload size={16} className="text-white" />
            </div>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px' }}>
              Africa<span style={{ color: '#C9972A' }}>Transfer</span>
            </span>
          </Link>

          {sent ? (
            <div className="text-center card p-10">
              <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Email envoyé !</h2>
              <p className="text-sm text-gray-500 mb-2">
                Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Vérifiez aussi vos <strong>spams</strong> si vous ne le voyez pas dans les 2 minutes.
              </p>
              <Link href="/auth/login"
                className="flex items-center justify-center gap-2 text-sm text-yellow-600 hover:underline">
                <ArrowLeft size={14} /> Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Mot de passe oublié ?</h1>
              <p className="text-gray-400 text-sm mb-8">
                Entrez votre email et nous vous enverrons un lien de réinitialisation Firebase.
              </p>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 animate-fade-in">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Adresse email</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Envoi en cours...</>
                    : 'Envoyer le lien de réinitialisation'
                  }
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/auth/login"
                  className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  <ArrowLeft size={14} /> Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}