import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Check, X, Zap, ArrowRight, Shield, Globe } from 'lucide-react'
import { useAuth } from '../lib/auth-context'

const COUNTRIES = [
  { flag: '🇧🇯', name: 'Bénin' },
  { flag: '🇹🇬', name: 'Togo' },
  { flag: '🇨🇮', name: "Côte d'Ivoire" },
  { flag: '🇧🇫', name: 'Burkina Faso' },
  { flag: '🇸🇳', name: 'Sénégal' },
  { flag: '🇨🇬', name: 'Congo' },
]

const PAYMENT_METHODS = [
  {
    country: '🇧🇯 Bénin',
    methods: ['MTN Mobile Money', 'Moov Money', 'Celtiis Money'],
  },
  {
    country: '🇹🇬 Togo',
    methods: ['Moov Money', 'TMoney'],
  },
  {
    country: "🇨🇮 Côte d'Ivoire",
    methods: ['MTN Mobile Money', 'Orange Money', 'Wave', 'Moov Money'],
  },
  {
    country: '🇧🇫 Burkina Faso',
    methods: ['Orange Money', 'Moov Money', 'Coris Money'],
  },
  {
    country: '🇸🇳 Sénégal',
    methods: ['Orange Money', 'Wave', 'Free Money'],
  },
  {
    country: '🇨🇬 Congo',
    methods: ['MTN Mobile Money', 'Airtel Money'],
  },
]

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  'MTN Mobile Money': { bg: '#FFC107', text: '#000' },
  'Moov Money':       { bg: '#0066CC', text: '#FFF' },
  'Orange Money':     { bg: '#FF6600', text: '#FFF' },
  'Wave':             { bg: '#1A9AEF', text: '#FFF' },
  'Celtiis Money':    { bg: '#6D28D9', text: '#FFF' },
  'TMoney':           { bg: '#DC2626', text: '#FFF' },
  'Coris Money':      { bg: '#059669', text: '#FFF' },
  'Free Money':       { bg: '#D97706', text: '#FFF' },
  'Airtel Money':     { bg: '#E11D48', text: '#FFF' },
}

export default function Pricing() {
  const { user, userData } = useAuth()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')

  const FREE_FEATURES = [
    { text: 'Jusqu\'à 2 Go par transfert', ok: true },
    { text: 'Liens valables 7 jours', ok: true },
    { text: 'Protection par mot de passe', ok: true },
    { text: 'Envoi sans compte', ok: true },
    { text: 'QR code de partage', ok: true },
    { text: 'Stockage prolongé (1 an)', ok: false },
    { text: 'API publique', ok: false },
    { text: 'Extension Chrome', ok: false },
    { text: 'Support prioritaire', ok: false },
  ]

  const PREMIUM_FEATURES = [
    { text: 'Jusqu\'à 200 Go par transfert', ok: true },
    { text: 'Liens valables 1 an', ok: true },
    { text: 'Protection par mot de passe', ok: true },
    { text: 'Envoi sans compte', ok: true },
    { text: 'QR code de partage', ok: true },
    { text: 'Stockage prolongé (1 an)', ok: true },
    { text: 'API publique', ok: true },
    { text: 'Extension Chrome', ok: true },
    { text: 'Support prioritaire', ok: true },
  ]

  const monthlyPrice = 3500
  const yearlyPrice = 35000
  const yearlyMonthly = Math.round(yearlyPrice / 12)
  const savings = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100)

  return (
    <>
      <Head>
        <title>Tarifs — AfricaTransfer</title>
        <meta name="description" content="Comparez les plans gratuit et premium d'AfricaTransfer. Payez avec Mobile Money (MTN, Moov, Orange)." />
      </Head>

      <Navbar />

      <main className="pt-24 pb-0">
        {/* Header */}
        <section className="py-16 text-center">
          <div className="max-w-3xl mx-auto px-4">
            <div className="divider mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-semibold mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Simple et transparent
            </h1>
            <p className="text-gray-500 text-lg mb-10">
              Commencez gratuitement. Passez Premium quand vous avez besoin de plus.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setBilling('monthly')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${billing === 'monthly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBilling('yearly')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${billing === 'yearly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Annuel
                {billing === 'yearly' && (
                  <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: 'linear-gradient(135deg,#C9972A,#E4B84A)' }}>
                    -{savings}%
                  </span>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="pb-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Free */}
              <div className="card p-8 animate-slide-up stagger-1">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Gratuit</h2>
                  <p className="text-sm text-gray-400">Pour commencer sans engagement</p>
                </div>

                <div className="mb-8">
                  <span className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>0</span>
                  <span className="text-lg text-gray-500 ml-1">FCFA</span>
                  <p className="text-xs text-gray-400 mt-1">Pour toujours</p>
                </div>

                {user && userData?.plan === 'free' ? (
                  <div className="w-full py-3 rounded-xl border border-gray-200 text-center text-sm text-gray-500 mb-8">
                    ✓ Votre plan actuel
                  </div>
                ) : (
                  <Link href="/"
                    className="block w-full py-3 rounded-xl border-2 border-gray-200 text-center text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all mb-8">
                    Commencer gratuitement
                  </Link>
                )}

                <ul className="space-y-3">
                  {FREE_FEATURES.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      {feat.ok
                        ? <Check size={16} style={{ color: '#C9972A', flexShrink: 0 }} />
                        : <X size={16} className="text-gray-200 flex-shrink-0" />
                      }
                      <span className={feat.ok ? 'text-gray-700' : 'text-gray-300'}>{feat.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium */}
              <div className="plan-popular card p-8 animate-slide-up stagger-2 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-white text-xs font-medium" style={{ background: 'linear-gradient(135deg,#C9972A,#E4B84A)' }}>
                    ✦ Recommandé
                  </span>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Premium</h2>
                  <p className="text-sm text-gray-400">Pour les professionnels et équipes</p>
                </div>

                <div className="mb-8">
                  {billing === 'yearly' ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                          {yearlyMonthly.toLocaleString()}
                        </span>
                        <span className="text-lg text-gray-500">FCFA/mois</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Facturé {yearlyPrice.toLocaleString()} FCFA/an — économisez {(monthlyPrice * 12 - yearlyPrice).toLocaleString()} FCFA
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                        {monthlyPrice.toLocaleString()}
                      </span>
                      <span className="text-lg text-gray-500 ml-1">FCFA/mois</span>
                      <p className="text-xs text-gray-400 mt-1">Facturé mensuellement</p>
                    </>
                  )}
                </div>

                {user && userData?.plan === 'premium' ? (
                  <div className="w-full py-3 rounded-xl text-center text-sm font-medium text-white mb-8"
                    style={{ background: 'linear-gradient(135deg,#C9972A,#E4B84A)' }}>
                    ✓ Votre plan actuel
                  </div>
                ) : (
                  <Link href={`/checkout?plan=premium&billing=${billing}`}
                    className="btn-gold block w-full py-3 rounded-xl text-center text-sm font-medium mb-8">
                    Passer Premium
                    <ArrowRight size={14} className="inline ml-2" />
                  </Link>
                )}

                <ul className="space-y-3">
                  {PREMIUM_FEATURES.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <Check size={16} style={{ color: '#C9972A', flexShrink: 0 }} />
                      <span className="text-gray-700">{feat.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Payment methods */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Modes de paiement acceptés
              </h2>
              <p className="text-gray-500 text-sm">
                Payez avec votre Mobile Money préféré, en toute sécurité via FeexPay.
              </p>
            </div>

            {/* Par pays */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {PAYMENT_METHODS.map((c, i) => (
                <div key={i} className="card p-5">
                  <p className="text-sm font-semibold text-gray-900 mb-3">{c.country}</p>
                  <div className="flex flex-wrap gap-2">
                    {c.methods.map((m, j) => {
                      const color = METHOD_COLORS[m] || { bg: '#6B7280', text: '#FFF' }
                      return (
                        <span
                          key={j}
                          className="text-xs px-2.5 py-1 rounded-lg font-medium"
                          style={{ background: color.bg, color: color.text }}
                        >
                          {m}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Carte bancaire */}
            <div className="card p-5 max-w-sm mx-auto text-center mb-10">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Également acceptées</p>
              <div className="flex items-center justify-center gap-3">
                <span className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: '#1A56DB' }}>VISA</span>
                <span className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: '#EB5757' }}>Mastercard</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield size={14} style={{ color: '#C9972A' }} />
                <span>Paiement 100% sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={14} style={{ color: '#C9972A' }} />
                <span>Activation instantanée</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={14} style={{ color: '#C9972A' }} />
                <span>Annulable à tout moment</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Questions fréquentes</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'Que se passe-t-il après 7 jours en plan gratuit ?',
                  a: 'Vos fichiers sont automatiquement supprimés de nos serveurs. Les liens ne fonctionneront plus. Vous recevez un email de rappel avant expiration.',
                },
                {
                  q: 'Puis-je envoyer sans créer de compte ?',
                  a: 'Oui. Vous pouvez envoyer et partager des fichiers sans compte. Un compte vous permet de suivre vos transferts, d\'accéder à votre historique et de gérer vos fichiers.',
                },
                {
                  q: 'Comment fonctionne le paiement Mobile Money ?',
                  a: 'Vous entrez votre numéro de téléphone et vous recevez une demande de confirmation sur votre téléphone. Le paiement est traité par FeexPay, une plateforme de paiement africaine sécurisée.',
                },
                {
                  q: 'Puis-je partager des fichiers protégés par mot de passe ?',
                  a: 'Oui, disponible en plan gratuit et premium. Le destinataire devra saisir le mot de passe que vous avez défini pour accéder aux fichiers.',
                },
                {
                  q: 'Quelle est la taille maximale d\'un fichier ?',
                  a: 'En plan gratuit : 500 Mo par fichier, 2 Go total par transfert. En plan Premium : 50 Go par fichier, 200 Go total par transfert.',
                },
              ].map((faq, i) => (
                <details key={i} className="card p-5 group cursor-pointer">
                  <summary className="flex items-center justify-between font-medium text-gray-900 text-sm list-none">
                    {faq.q}
                    <span className="text-gray-400 group-open:rotate-45 transition-transform text-lg leading-none ml-4 flex-shrink-0">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Countries */}
        <section className="bg-black py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-4 mb-10">
              <div className="h-px flex-1 bg-gray-800" />
              <span className="text-xs text-gray-500 uppercase tracking-widest">Pays disponibles</span>
              <div className="h-px flex-1 bg-gray-800" />
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {COUNTRIES.map((country, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:bg-white/5 group"
                >
                  <span className="text-3xl leading-none">{country.flag}</span>
                  <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors text-center">
                    {country.name}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-600 mt-8">
              Paiement Mobile Money disponible dans ces pays · D'autres pays arrivent bientôt
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}