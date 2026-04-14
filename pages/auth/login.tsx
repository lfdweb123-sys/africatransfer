import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../lib/auth-context'
import { Upload, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function TransferIllustration() {
  return (
    <div className="flex flex-col items-center gap-6">
      <svg width="260" height="260" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="140" cy="140" r="110" stroke="#C9972A" strokeWidth="0.5" strokeOpacity="0.2"/>
        <circle cx="140" cy="140" r="80" stroke="#C9972A" strokeWidth="0.5" strokeOpacity="0.15"/>
        <rect x="22" y="85" width="72" height="110" rx="10" fill="#111111" stroke="#C9972A" strokeWidth="1.5"/>
        <rect x="30" y="96" width="56" height="75" rx="4" fill="#1A1A1A"/>
        <circle cx="58" cy="186" r="5" fill="#C9972A" fillOpacity="0.4"/>
        <rect x="36" y="104" width="40" height="5" rx="2.5" fill="#C9972A" fillOpacity="0.7"/>
        <rect x="36" y="114" width="30" height="3" rx="1.5" fill="#C9972A" fillOpacity="0.4"/>
        <rect x="36" y="121" width="34" height="3" rx="1.5" fill="#C9972A" fillOpacity="0.3"/>
        <rect x="36" y="128" width="24" height="3" rx="1.5" fill="#C9972A" fillOpacity="0.2"/>
        <rect x="36" y="138" width="22" height="26" rx="3" fill="#C9972A" fillOpacity="0.1" stroke="#C9972A" strokeWidth="1"/>
        <path d="M52 138 L58 144" stroke="#C9972A" strokeWidth="1" fill="none"/>
        <path d="M52 138 L52 144 L58 144" fill="#C9972A" fillOpacity="0.15"/>
        <rect x="39" y="148" width="14" height="2" rx="1" fill="#C9972A" fillOpacity="0.4"/>
        <rect x="39" y="153" width="10" height="2" rx="1" fill="#C9972A" fillOpacity="0.3"/>
        <rect x="186" y="85" width="72" height="110" rx="10" fill="#111111" stroke="#C9972A" strokeWidth="1.5"/>
        <rect x="194" y="96" width="56" height="75" rx="4" fill="#1A1A1A"/>
        <circle cx="222" cy="186" r="5" fill="#C9972A" fillOpacity="0.4"/>
        <rect x="200" y="104" width="40" height="5" rx="2.5" fill="#C9972A" fillOpacity="0.7"/>
        <rect x="200" y="114" width="30" height="3" rx="1.5" fill="#C9972A" fillOpacity="0.4"/>
        <rect x="200" y="121" width="34" height="3" rx="1.5" fill="#C9972A" fillOpacity="0.3"/>
        <rect x="200" y="128" width="24" height="3" rx="1.5" fill="#C9972A" fillOpacity="0.2"/>
        <rect x="200" y="138" width="22" height="26" rx="3" fill="#C9972A" fillOpacity="0.1" stroke="#C9972A" strokeWidth="1"/>
        <path d="M216 138 L222 144" stroke="#C9972A" strokeWidth="1" fill="none"/>
        <path d="M216 138 L216 144 L222 144" fill="#C9972A" fillOpacity="0.15"/>
        <rect x="203" y="148" width="14" height="2" rx="1" fill="#C9972A" fillOpacity="0.4"/>
        <rect x="203" y="153" width="10" height="2" rx="1" fill="#C9972A" fillOpacity="0.3"/>
        <rect x="112" y="100" width="56" height="70" rx="8" fill="#1A1A1A" stroke="#C9972A" strokeWidth="1.5"/>
        <path d="M150 100 L168 116" stroke="#C9972A" strokeWidth="1.5" fill="none"/>
        <path d="M150 100 L150 116 L168 116" fill="#C9972A" fillOpacity="0.15"/>
        <rect x="120" y="124" width="32" height="4" rx="2" fill="#C9972A" fillOpacity="0.6"/>
        <rect x="120" y="133" width="24" height="3" rx="1.5" fill="#C9972A" fillOpacity="0.4"/>
        <rect x="120" y="141" width="28" height="3" rx="1.5" fill="#C9972A" fillOpacity="0.3"/>
        <rect x="120" y="149" width="20" height="3" rx="1.5" fill="#C9972A" fillOpacity="0.2"/>
        <path d="M96 140 L110 140" stroke="#C9972A" strokeWidth="1.5" strokeDasharray="3 2"/>
        <path d="M106 135 L112 140 L106 145" stroke="#C9972A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M170 140 L184 140" stroke="#C9972A" strokeWidth="1.5" strokeDasharray="3 2"/>
        <path d="M180 135 L186 140 L180 145" stroke="#C9972A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="140" cy="52" r="4" fill="#C9972A" fillOpacity="0.5"/>
        <circle cx="140" cy="228" r="4" fill="#C9972A" fillOpacity="0.5"/>
        <path d="M168 70 L170 64 L172 70 L178 72 L172 74 L170 80 L168 74 L162 72 Z" fill="#C9972A" fillOpacity="0.4"/>
        <circle cx="140" cy="200" r="16" fill="#1A1A1A" stroke="#C9972A" strokeWidth="1"/>
        <path d="M136 197 C136 194.5 137.5 193 140 193 C142.5 193 144 194.5 144 197 L144 200 L136 200 Z" fill="#C9972A" fillOpacity="0.3"/>
        <path d="M136 200 L144 200 L144 205 L136 205 Z" fill="#C9972A" fillOpacity="0.5"/>
      </svg>
      <div className="text-center space-y-1">
        <p className="text-white text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Transfert sécurisé entre l'Afrique et le monde
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
          <p className="text-xs text-gray-500">Chiffré · Rapide · Fiable</p>
        </div>
      </div>
      <div className="flex gap-6 mt-2">
        {[{ val: '2 Go', label: 'Gratuit' }, { val: '200 Go', label: 'Premium' }, { val: '7 jrs', label: 'Rétention' }].map((s, i) => (
          <div key={i} className="text-center">
            <p className="text-lg font-semibold" style={{ color: '#C9972A', fontFamily: 'Cormorant Garamond, serif' }}>{s.val}</p>
            <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth()
  const router = useRouter()
  const redirect = (router.query.redirect as string) || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  // Fonction utilitaire centralisée — appel non bloquant
async function triggerLoginAlert(email: string, name: string) {
  try {
    await fetch('/api/auth/login-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    })
  } catch (e) {
    console.error('[LoginAlert] Échec:', e)
  }
}

async function handleLogin(e: React.FormEvent) {
  e.preventDefault()
  setError('')
  setLoading(true)
  try {
    await signIn(email, password)
    // Récupérer le displayName depuis Firebase pour l'email
    const { currentUser } = await import('../../lib/firebase').then(m => ({ currentUser: m.auth.currentUser }))
    const name = currentUser?.displayName || email.split('@')[0]
    // Non bloquant — ne pas await pour ne pas retarder la navigation
    triggerLoginAlert(email, name)
    toast.success('Connexion réussie !')
    router.push(redirect)
  } catch (err: any) {
    const msg = err.code === 'auth/invalid-credential'
      ? 'Email ou mot de passe incorrect'
      : err.code === 'auth/too-many-requests'
      ? 'Trop de tentatives. Réessayez plus tard.'
      : 'Erreur de connexion. Vérifiez vos informations.'
    setError(msg)
  } finally {
    setLoading(false)
  }
}

async function handleGoogle() {
  setError('')
  setGoogleLoading(true)
  try {
    await signInWithGoogle()
    const { currentUser } = await import('../../lib/firebase').then(m => ({ currentUser: m.auth.currentUser }))
    const name = currentUser?.displayName || 'Utilisateur'
    const userEmail = currentUser?.email || ''
    triggerLoginAlert(userEmail, name)
    toast.success('Connexion réussie !')
    router.push(redirect)
  } catch (err: any) {
    setError(err.message || 'Erreur lors de la connexion avec Google.')
  } finally {
    setGoogleLoading(false)
  }
}

  return (
    <>
      <Head><title>Connexion — AfricaTransfer</title></Head>
      <div className="min-h-screen flex" style={{ background: '#FAFAFA' }}>
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12 relative overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 30% 70%, rgba(201,151,42,0.12) 0%, transparent 50%),
                             radial-gradient(circle at 70% 20%, rgba(201,151,42,0.08) 0%, transparent 50%)`,
          }} />
          <Link href="/" className="flex items-center gap-2 relative z-10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#C9972A,#E4B84A)' }}>
              <Upload size={16} className="text-white" />
            </div>
            <span className="font-display text-xl text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Africa<span style={{ color: '#C9972A' }}>Transfer</span>
            </span>
          </Link>
          <div className="relative z-10 flex items-center justify-center flex-1 py-8">
            <TransferIllustration />
          </div>
          <div className="relative z-10">
            <blockquote className="text-base font-light text-gray-500 leading-relaxed italic" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              "Partagez vos fichiers avec l'Afrique entière.<br />
              <span style={{ color: '#C9972A' }}>Simplement. Rapidement. Sécurisé.</span>"
            </blockquote>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md animate-slide-up">
            <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#C9972A,#E4B84A)' }}>
                <Upload size={16} className="text-white" />
              </div>
              <span className="font-display text-xl" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Africa<span style={{ color: '#C9972A' }}>Transfer</span>
              </span>
            </Link>

            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Bon retour !</h1>
            <p className="text-gray-400 text-sm mb-8">
              Pas encore de compte ?{' '}
              <Link href="/auth/register" className="text-yellow-600 hover:underline">Créez-en un</Link>
            </p>

            <button onClick={handleGoogle} disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm font-medium text-gray-700 mb-6 disabled:opacity-50">
              {googleLoading ? <Loader2 size={16} className="animate-spin" /> : (
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continuer avec Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center">
                <span className="bg-gray-50 px-3 text-xs text-gray-400">ou avec votre email</span>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 animate-fade-in">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Adresse email</label>
                <input type="email" required className="input-field" placeholder="vous@exemple.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-medium text-gray-500">Mot de passe</label>
                  <Link href="/auth/forgot-password" className="text-xs text-yellow-600 hover:underline">Mot de passe oublié ?</Link>
                </div>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required className="input-field pr-10"
                    placeholder="Votre mot de passe" value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="btn-gold w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Connexion...</> : 'Se connecter'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400">
              En vous connectant, vous acceptez nos{' '}
              <Link href="/legal/terms" className="hover:underline">CGU</Link> et{' '}
              <Link href="/legal/privacy" className="hover:underline">politique de confidentialité</Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
