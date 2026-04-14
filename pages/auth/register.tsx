import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../lib/auth-context'
import { Upload, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function TransferIllustration() {
  return (
    <div className="flex flex-col items-center gap-6">
      <svg width="260" height="240" viewBox="0 0 280 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cercles décoratifs */}
        <circle cx="140" cy="120" r="100" stroke="#C9972A" strokeWidth="0.5" strokeOpacity="0.2"/>
        <circle cx="140" cy="120" r="70" stroke="#C9972A" strokeWidth="0.5" strokeOpacity="0.15"/>

        {/* Nuage gauche */}
        <ellipse cx="60" cy="100" rx="35" ry="20" fill="#1A1A1A" stroke="#C9972A" strokeWidth="1"/>
        <ellipse cx="48" cy="108" rx="28" ry="15" fill="#1A1A1A" stroke="#C9972A" strokeWidth="1"/>
        <ellipse cx="72" cy="108" rx="28" ry="15" fill="#1A1A1A" stroke="#C9972A" strokeWidth="1"/>
        <ellipse cx="60" cy="112" rx="35" ry="12" fill="#1A1A1A"/>

        {/* Nuage droit */}
        <ellipse cx="220" cy="100" rx="35" ry="20" fill="#1A1A1A" stroke="#C9972A" strokeWidth="1"/>
        <ellipse cx="208" cy="108" rx="28" ry="15" fill="#1A1A1A" stroke="#C9972A" strokeWidth="1"/>
        <ellipse cx="232" cy="108" rx="28" ry="15" fill="#1A1A1A" stroke="#C9972A" strokeWidth="1"/>
        <ellipse cx="220" cy="112" rx="35" ry="12" fill="#1A1A1A"/>

        {/* Icône upload dans nuage gauche */}
        <path d="M52 104 L60 96 L68 104" stroke="#C9972A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <line x1="60" y1="96" x2="60" y2="110" stroke="#C9972A" strokeWidth="2" strokeLinecap="round"/>
        <line x1="53" y1="110" x2="67" y2="110" stroke="#C9972A" strokeWidth="2" strokeLinecap="round"/>

        {/* Icône download dans nuage droit */}
        <path d="M212 104 L220 112 L228 104" stroke="#C9972A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <line x1="220" y1="112" x2="220" y2="98" stroke="#C9972A" strokeWidth="2" strokeLinecap="round"/>
        <line x1="213" y1="114" x2="227" y2="114" stroke="#C9972A" strokeWidth="2" strokeLinecap="round"/>

        {/* Fichiers qui volent au centre */}
        {/* Fichier 1 - principal */}
        <rect x="112" y="80" width="56" height="70" rx="8" fill="#111111" stroke="#C9972A" strokeWidth="1.5"/>
        <path d="M150 80 L168 96" stroke="#C9972A" strokeWidth="1.5" fill="none"/>
        <path d="M150 80 L150 96 L168 96" fill="#C9972A" fillOpacity="0.12"/>
        <rect x="120" y="104" width="32" height="4" rx="2" fill="#C9972A" fillOpacity="0.7"/>
        <rect x="120" y="113" width="24" height="3" rx="1.5" fill="#C9972A" fillOpacity="0.4"/>
        <rect x="120" y="121" width="28" height="3" rx="1.5" fill="#C9972A" fillOpacity="0.3"/>
        <rect x="120" y="129" width="18" height="3" rx="1.5" fill="#C9972A" fillOpacity="0.2"/>

        {/* Fichier 2 - derrière gauche */}
        <rect x="96" y="90" width="48" height="60" rx="6" fill="#0D0D0D" stroke="#C9972A" strokeWidth="1" strokeOpacity="0.5"/>
        <rect x="103" y="108" width="28" height="3" rx="1.5" fill="#C9972A" fillOpacity="0.3"/>
        <rect x="103" y="115" width="20" height="3" rx="1.5" fill="#C9972A" fillOpacity="0.2"/>

        {/* Fichier 3 - derrière droite */}
        <rect x="136" y="92" width="48" height="58" rx="6" fill="#0D0D0D" stroke="#C9972A" strokeWidth="1" strokeOpacity="0.5"/>
        <rect x="143" y="110" width="28" height="3" rx="1.5" fill="#C9972A" fillOpacity="0.3"/>
        <rect x="143" y="117" width="20" height="3" rx="1.5" fill="#C9972A" fillOpacity="0.2"/>

        {/* Flèches de transfert */}
        <path d="M97 120 L110 120" stroke="#C9972A" strokeWidth="1.5" strokeDasharray="3 2"/>
        <path d="M106 115 L112 120 L106 125" stroke="#C9972A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

        <path d="M170 120 L183 120" stroke="#C9972A" strokeWidth="1.5" strokeDasharray="3 2"/>
        <path d="M179 115 L185 120 L179 125" stroke="#C9972A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

        {/* Statistiques en bas */}
        <rect x="60" y="170" width="160" height="50" rx="10" fill="#111111" stroke="#C9972A" strokeWidth="1"/>

        <circle cx="90" cy="195" r="12" fill="#C9972A" fillOpacity="0.15" stroke="#C9972A" strokeWidth="1"/>
        <path d="M85 195 L88 198 L95 191" stroke="#C9972A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <rect x="108" y="188" width="40" height="4" rx="2" fill="#C9972A" fillOpacity="0.6"/>
        <rect x="108" y="197" width="28" height="3" rx="1.5" fill="#C9972A" fillOpacity="0.3"/>

        <line x1="160" y1="178" x2="160" y2="212" stroke="#C9972A" strokeWidth="0.5" strokeOpacity="0.3"/>

        <circle cx="175" cy="195" r="12" fill="#C9972A" fillOpacity="0.15" stroke="#C9972A" strokeWidth="1"/>
        <path d="M170 198 L175 190 L180 198" stroke="#C9972A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <rect x="193" y="188" width="20" height="4" rx="2" fill="#C9972A" fillOpacity="0.6"/>
        <rect x="193" y="197" width="14" height="3" rx="1.5" fill="#C9972A" fillOpacity="0.3"/>

        {/* Points décoratifs */}
        <circle cx="140" cy="36" r="4" fill="#C9972A" fillOpacity="0.5"/>
        <circle cx="30" cy="150" r="3" fill="#C9972A" fillOpacity="0.3"/>
        <circle cx="250" cy="150" r="3" fill="#C9972A" fillOpacity="0.3"/>

        {/* Sparkles */}
        <path d="M170 56 L172 50 L174 56 L180 58 L174 60 L172 66 L170 60 L164 58 Z" fill="#C9972A" fillOpacity="0.4"/>
        <path d="M98 240 L99.5 236 L101 240 L105 241.5 L101 243 L99.5 247 L98 243 L94 241.5 Z" fill="#C9972A" fillOpacity="0.25"/>
      </svg>

      <div className="text-center">
        <p className="text-white text-base font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Rejoignez la communauté AfricaTransfer
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
          <p className="text-xs text-gray-500">Gratuit · Sécurisé · Sans limite de compte</p>
        </div>
      </div>
    </div>
  )
}

  export default function Register() {
    const { signUp, signInWithGoogle } = useAuth()
    const router = useRouter()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState('')

    const passwordStrength = password.length === 0 ? 0
      : password.length < 6 ? 1
      : password.length < 10 ? 2
      : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
      : 3

    const strengthLabels = ['', 'Trop court', 'Faible', 'Moyen', 'Fort']
    const strengthColors = ['', '#EF4444', '#F59E0B', '#C9972A', '#10B981']

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setLoading(true)
    try {
      // ✅ signUp appelle déjà sendWelcome en interne — pas besoin de le faire ici
      await signUp(email, password, name)
      toast.success('Compte créé ! Bienvenue sur AfricaTransfer 🎉')
      router.push('/dashboard')
    } catch (err: any) {
      const msg =
        err.code === 'auth/email-already-in-use'
          ? 'Cet email est déjà utilisé. Connectez-vous.'
          : err.code === 'auth/weak-password'
          ? 'Mot de passe trop faible.'
          : 'Erreur lors de la création du compte.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    try {
      // ✅ signInWithGoogle appelle déjà sendWelcome pour les nouveaux comptes
      await signInWithGoogle()
      toast.success('Bienvenue sur AfricaTransfer ! 🎉')
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Erreur avec Google. Réessayez.')
    } finally {
      setGoogleLoading(false)
    }
  }


  return (
    <>
      <Head>
        <title>Créer un compte — AfricaTransfer</title>
      </Head>

      <div className="min-h-screen flex" style={{ background: '#FAFAFA' }}>
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12 relative overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 70% 30%, rgba(201,151,42,0.12) 0%, transparent 50%),
                             radial-gradient(circle at 20% 70%, rgba(201,151,42,0.08) 0%, transparent 50%)`,
          }} />

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 relative z-10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#C9972A,#E4B84A)' }}>
              <Upload size={16} className="text-white" />
            </div>
            <span className="font-display text-xl text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Africa<span style={{ color: '#C9972A' }}>Transfer</span>
            </span>
          </Link>

          {/* Illustration */}
          <div className="relative z-10 flex items-center justify-center flex-1 py-6">
            <TransferIllustration />
          </div>

          {/* Features bas */}
          <div className="relative z-10 space-y-3">
            {[
              'Suivi de tous vos transferts',
              'Historique complet de vos envois',
              'Gérez et supprimez vos fichiers',
              'Accédez à votre plan Premium',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle size={15} style={{ color: '#C9972A', flexShrink: 0 }} />
                <span className="text-sm text-gray-400">{feat}</span>
              </div>
            ))}
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

            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Créer un compte</h1>
            <p className="text-gray-400 text-sm mb-8">
              Déjà inscrit ?{' '}
              <Link href="/auth/login" className="text-yellow-600 hover:underline">Connectez-vous</Link>
            </p>

            {/* Google */}
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
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gray-50 px-3 text-xs text-gray-400">ou avec votre email</span>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 animate-fade-in">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Nom complet</label>
                <input type="text" required className="input-field" placeholder="Kofi Mensah"
                  value={name} onChange={e => setName(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Adresse email</label>
                <input type="email" required className="input-field" placeholder="vous@exemple.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input-field pr-10"
                    placeholder="Minimum 6 caractères"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2 space-y-1 animate-fade-in">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{ background: i <= passwordStrength ? strengthColors[passwordStrength] : '#E5E5E5' }} />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: strengthColors[passwordStrength] }}>
                      {strengthLabels[passwordStrength]}
                    </p>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading}
                className="btn-gold w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Création...</> : 'Créer mon compte'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400">
              En créant un compte, vous acceptez nos{' '}
              <Link href="/legal/terms" className="hover:underline">CGU</Link> et{' '}
              <Link href="/legal/privacy" className="hover:underline">politique de confidentialité</Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}