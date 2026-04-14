import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/auth-context'
import Navbar from '../components/Navbar'
import Link from 'next/link'
import { Shield, CheckCircle, ArrowLeft, Star, Loader2, AlertCircle } from 'lucide-react'
import { FeexPayProvider, FeexPayButton } from '@feexpay/react-sdk'
import '@feexpay/react-sdk/style.css'
import toast from 'react-hot-toast'

// Plans et prix
const PLANS = {
  premium_monthly: {
    amount: 3500,
    label: 'Premium Mensuel',
    description: 'AfricaTransfer Premium 1 mois',
    billing: 'monthly',
  },
  premium_yearly: {
    amount: 35000,
    label: 'Premium Annuel',
    description: 'AfricaTransfer Premium 1 an',
    billing: 'yearly',
  },
}

const FEEXPAY_SHOP_ID = process.env.NEXT_PUBLIC_FEEXPAY_SHOP_ID || ''
const FEEXPAY_TOKEN = process.env.NEXT_PUBLIC_FEEXPAY_TOKEN || ''

function generateCustomId() {
  return 'AT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

export default function Checkout() {
  const router = useRouter()
  const { billing = 'yearly' } = router.query
  const { user, userData, refreshUserData } = useAuth()

  const planKey = billing === 'yearly' ? 'premium_yearly' : 'premium_monthly'
  const plan = PLANS[planKey]

  const [customId] = useState(generateCustomId)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [loading, setLoading] = useState(false)

  // Activer le plan après paiement réussi
  async function handlePaymentCallback(response: any) {
    console.log('FeexPay response:', response)

    if (response?.status === 'SUCCESS' || response?.success === true) {
      setLoading(true)
      try {
        // Notifier le backend pour activer le plan
        const res = await fetch('/api/payments/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.uid,
            email: user?.email,
            customId,
            billing: plan.billing,
            amount: plan.amount,
            feexpayResponse: response,
          }),
        })

        if (res.ok) {
          await refreshUserData()
          setPaymentStatus('success')
          toast.success('Plan Premium activé ! 🎉')
        } else {
          throw new Error('Activation failed')
        }
      } catch (err) {
        console.error('Activation error:', err)
        toast.error('Paiement reçu mais activation échouée. Contactez le support.')
        setPaymentStatus('error')
      } finally {
        setLoading(false)
      }
    } else {
      setPaymentStatus('error')
      toast.error('Paiement échoué ou annulé.')
    }
  }

  // Page succès
  if (paymentStatus === 'success') {
    return (
      <>
        <Head><title>Paiement réussi — AfricaTransfer</title></Head>
        <Navbar />
        <div className="pt-16 min-h-screen flex items-center justify-center p-8" style={{ background: '#FAFAFA' }}>
          <div className="max-w-md w-full card p-10 text-center animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Plan Premium activé ! 🎉
            </h1>
            <p className="text-gray-500 text-sm mb-2">
              Bienvenue dans la famille Premium AfricaTransfer.
            </p>
            <p className="text-gray-400 text-xs mb-8">
              Référence : <span className="font-mono text-gray-600">{customId}</span>
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left space-y-2">
              {[
                '200 Go par transfert',
                'Fichiers valables 1 an',
                'Accès API publique',
                'Extension Chrome',
                'Support prioritaire',
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle size={13} style={{ color: '#C9972A' }} />
                  <span className="text-gray-700">{f}</span>
                </div>
              ))}
            </div>

            <Link href="/dashboard"
              className="btn-gold block w-full py-3 rounded-xl text-sm font-medium text-center">
              Accéder à mon espace Premium
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Passer Premium — AfricaTransfer</title>
        <meta name="description" content="Passez au plan Premium AfricaTransfer avec Mobile Money." />
      </Head>
      <Navbar />

      <div className="pt-16 min-h-screen" style={{ background: '#FAFAFA' }}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link href="/pricing"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8">
            <ArrowLeft size={14} />
            Retour aux tarifs
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Colonne gauche — formulaire */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  Passer au plan Premium
                </h1>
                <p className="text-gray-400 text-sm">
                  Paiement sécurisé via FeexPay · Mobile Money accepté
                </p>
              </div>

              {/* Sélection billing */}
              <div className="card p-5">
                <p className="text-sm font-medium text-gray-700 mb-3">Choisissez votre engagement</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'yearly', label: 'Annuel', price: '35 000', sub: 'soit 2 917 FCFA/mois', badge: 'Économisez 17%' },
                    { key: 'monthly', label: 'Mensuel', price: '3 500', sub: 'par mois', badge: null },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => router.push(`/checkout?billing=${opt.key}`, undefined, { shallow: true })}
                      className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                        billing === opt.key
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {opt.badge && (
                        <span className="absolute -top-2.5 left-3 text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ background: 'linear-gradient(135deg,#C9972A,#E4B84A)' }}>
                          {opt.badge}
                        </span>
                      )}
                      <p className="font-semibold text-gray-900 text-sm">{opt.label}</p>
                      <p className="text-lg font-bold mt-1" style={{ color: '#C9972A', fontFamily: 'Cormorant Garamond, serif' }}>
                        {opt.price} <span className="text-xs font-normal text-gray-500">FCFA</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.sub}</p>
                      {billing === opt.key && (
                        <CheckCircle size={16} style={{ color: '#C9972A', position: 'absolute', top: 12, right: 12 }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zone paiement */}
              <div className="card p-6">
                <p className="text-sm font-medium text-gray-700 mb-1">Payer avec Mobile Money</p>
                <p className="text-xs text-gray-400 mb-5">
                  MTN Mobile Money · Moov Money · Orange Money · et plus
                </p>

                {!user ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={16} style={{ color: '#C9972A', marginTop: 1 }} />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Connexion requise</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          <Link href="/auth/login?redirect=/checkout" className="underline">Connectez-vous</Link> ou{' '}
                          <Link href="/auth/register?redirect=/checkout" className="underline">créez un compte</Link> pour continuer.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : userData?.plan === 'premium' ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                    <CheckCircle size={18} className="text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Vous êtes déjà Premium !</p>
                      <Link href="/dashboard" className="text-xs text-green-700 underline">Accéder au dashboard</Link>
                    </div>
                  </div>
                ) : loading ? (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <Loader2 size={32} className="animate-spin" style={{ color: '#C9972A' }} />
                    <p className="text-sm text-gray-500">Activation de votre plan...</p>
                  </div>
                ) : (
                  <FeexPayProvider>
                    <FeexPayButton
                      amount={plan.amount}
                      description={plan.description}
                      token={FEEXPAY_TOKEN}
                      id={FEEXPAY_SHOP_ID}
                      customId={customId}
                      callback_info={{
                        email: user?.email || '',
                        fullname: userData?.displayName || user?.displayName || '',
                        userId: user?.uid || '',
                        plan: planKey,
                      }}
                      mode="LIVE"
                      case=""
                      currency="XOF"
                      callback={handlePaymentCallback}
                      buttonText={`Payer ${plan.amount.toLocaleString()} FCFA`}
                      buttonClass="btn-gold w-full py-3.5 rounded-xl font-medium text-base flex items-center justify-center gap-2"
                    />
                  </FeexPayProvider>
                )}

                {/* Méthodes acceptées */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-3 text-center">Méthodes acceptées</p>
                  <div className="flex justify-center gap-3">
                    {[
                      { abbr: 'MTN', color: '#FFC107', text: '#000' },
                      { abbr: 'MOOV', color: '#0066CC', text: '#FFF' },
                      { abbr: 'OM', color: '#FF6600', text: '#FFF' },
                    ].map((m, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className="w-12 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ background: m.color, color: m.text }}>
                          {m.abbr}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Shield size={11} /> Sécurisé par FeexPay</span>
                  <span>·</span>
                  <span>Activation immédiate</span>
                </div>
              </div>
            </div>

            {/* Colonne droite — récap */}
            <div className="lg:col-span-2">
              <div className="card p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#C9972A,#E4B84A)' }}>
                    <Star size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Plan Premium</p>
                    <p className="text-xs text-gray-400">{billing === 'yearly' ? 'Facturation annuelle' : 'Facturation mensuelle'}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{plan.label}</span>
                    <span className="font-medium">{plan.amount.toLocaleString()} FCFA</span>
                  </div>
                  {billing === 'yearly' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Économie vs mensuel</span>
                      <span className="text-green-600 font-medium">-7 000 FCFA</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span style={{ color: '#C9972A' }}>{plan.amount.toLocaleString()} FCFA</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Ce que vous obtenez</p>
                  {[
                    '200 Go par transfert',
                    'Fichiers valables 1 an',
                    'Accès API publique',
                    'Extension Chrome',
                    'Support prioritaire',
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle size={13} style={{ color: '#C9972A', flexShrink: 0 }} />
                      <span className="text-xs text-gray-600">{feat}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400 text-center mt-4">
                  Référence de commande :<br />
                  <span className="font-mono text-gray-500">{customId}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
