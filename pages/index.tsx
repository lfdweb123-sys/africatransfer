import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import TransferForm from '../components/TransferForm'
import { Shield, Zap, Globe, Clock, ArrowRight, CheckCircle } from 'lucide-react'

const COUNTRIES = [
  { flag: '🇧🇯', name: 'Bénin' },
  { flag: '🇹🇬', name: 'Togo' },
  { flag: '🇨🇮', name: "Côte d'Ivoire" },
  { flag: '🇧🇫', name: 'Burkina Faso' },
  { flag: '🇸🇳', name: 'Sénégal' },
  { flag: '🇨🇬', name: 'Congo' },
]

export default function Home() {
  return (
    <>
      <Head>
        <title>AfricaTransfer — Envoyez vos fichiers facilement en Afrique</title>
        <meta name="description" content="Transférez vos fichiers volumineux en Afrique. Rapide, sécurisé, avec Mobile Money. Gratuit jusqu'à 2 Go." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </Head>

      <Navbar />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, rgba(201,151,42,0.06) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(201,151,42,0.04) 0%, transparent 50%)`,
          }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

              {/* Left */}
              <div className="animate-slide-up">
                <div className="badge-gold inline-flex items-center gap-2 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
                  Conçu pour l'Afrique
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6"
                  style={{ fontFamily: 'Cormorant Garamond, serif', letterSpacing: '-0.02em' }}>
                  Envoyez vos fichiers.<br />
                  <span className="text-gold-gradient">Simplement.</span>
                </h1>

                <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
                  Transférez des fichiers de toute taille en Afrique. Sans friction, sans compte obligatoire.
                  Payez avec Mobile Money.
                </p>

                <div className="grid grid-cols-3 gap-6 mb-8 py-6 border-y border-gray-100">
                  {[
                    { val: '2 Go', label: 'Gratuit' },
                    { val: '200 Go', label: 'Premium' },
                    { val: '100%', label: 'Sécurisé' },
                  ].map((stat, i) => (
                    <div key={i} className={`animate-slide-up stagger-${i + 1}`}>
                      <p className="stat-number text-2xl md:text-3xl">{stat.val}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  {[
                    'Aucun compte requis pour envoyer',
                    'Reprise automatique en cas de coupure réseau',
                    'Mobile Money : MTN, Moov, Orange Money',
                  ].map((feat, i) => (
                    <div key={i} className={`flex items-center gap-2 animate-slide-up stagger-${i + 2}`}>
                      <CheckCircle size={16} style={{ color: '#C9972A' }} />
                      <span className="text-sm text-gray-600">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right */}
              <div className="animate-slide-up stagger-2">
                <TransferForm />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="divider mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-semibold mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Pourquoi AfricaTransfer ?
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Une plateforme pensée pour les réalités africaines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Zap size={22} strokeWidth={1.5} style={{ color: '#C9972A' }} />,
                  title: 'Upload intelligent',
                  desc: 'Envoi par morceaux avec reprise automatique. Votre connexion peut couper, le transfert continue.',
                },
                {
                  icon: <Shield size={22} strokeWidth={1.5} style={{ color: '#C9972A' }} />,
                  title: 'Sécurisé',
                  desc: 'Liens uniques, protection par mot de passe, expiration automatique.',
                },
                {
                  icon: <Globe size={22} strokeWidth={1.5} style={{ color: '#C9972A' }} />,
                  title: 'Mobile Money',
                  desc: 'Passez Premium avec MTN, Moov Money ou Orange Money. Pas de carte bancaire nécessaire.',
                },
                {
                  icon: <Clock size={22} strokeWidth={1.5} style={{ color: '#C9972A' }} />,
                  title: 'Durée flexible',
                  desc: '7 jours en gratuit, 1 an en Premium. Suppression automatique après expiration.',
                },
              ].map((feat, i) => (
                <div key={i} className={`card card-hover p-6 animate-slide-up stagger-${i + 1}`}>
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center mb-4">
                    {feat.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feat.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="divider mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-semibold mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Comment ça marche ?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Ajoutez vos fichiers',
                  desc: 'Glissez-déposez ou sélectionnez vos fichiers. Tous formats, toutes tailles.',
                },
                {
                  step: '02',
                  title: 'Obtenez votre lien',
                  desc: 'En quelques secondes, un lien unique est généré. Partagez-le par WhatsApp, SMS ou email.',
                },
                {
                  step: '03',
                  title: 'Le destinataire télécharge',
                  desc: 'Un clic suffit. Pas de compte requis pour télécharger.',
                },
              ].map((step, i) => (
                <div key={i} className={`flex gap-5 animate-slide-up stagger-${i + 1}`}>
                  <div className="flex-shrink-0">
                    <span className="stat-number text-5xl leading-none opacity-20">{step.step}</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-black">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Prêt à envoyer vos premiers fichiers ?
            </h2>
            <p className="text-gray-400 mb-8">
              Gratuit, sans inscription. Passez Premium pour plus de capacité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="btn-gold px-8 py-3.5 rounded-xl font-medium flex items-center justify-center gap-2">
                Commencer maintenant
                <ArrowRight size={16} />
              </button>
              <Link href="/pricing"
                className="px-8 py-3.5 rounded-xl border border-gray-700 text-white hover:border-yellow-600 hover:text-yellow-500 transition-all text-center font-medium">
                Voir les tarifs
              </Link>
            </div>
          </div>
        </section>

        {/* Countries — fond noir pour assurer la continuité avec le CTA */}
        <section className="bg-black pb-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            {/* Séparateur doré */}
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