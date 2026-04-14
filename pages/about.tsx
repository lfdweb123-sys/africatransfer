import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Link from 'next/link'
import { ArrowRight, Globe, Shield, Zap, Heart } from 'lucide-react'

export default function About() {
  return (
    <>
      <Head>
        <title>À propos — AfricaTransfer</title>
        <meta name="description" content="AfricaTransfer est une plateforme de transfert de fichiers conçue pour l'Afrique." />
      </Head>

      <Navbar />

      <main className="pt-16">
        {/* Hero */}
        <section className="py-20 bg-black relative overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(201,151,42,0.1) 0%, transparent 50%)`,
          }} />
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <div className="badge-gold inline-block mb-6" style={{ background: 'rgba(201,151,42,0.1)', borderColor: 'rgba(201,151,42,0.3)', color: '#C9972A' }}>
              Notre mission
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold text-white mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Fait pour l'Afrique.<br />
              <span style={{ color: '#C9972A' }}>Par des Africains.</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              AfricaTransfer est né d'un constat simple : les solutions de transfert de fichiers existantes ne sont pas adaptées aux réalités africaines.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4">
            <div className="divider mb-8" />
            <h2 className="text-3xl font-semibold mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Notre histoire
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                En Afrique, partager un fichier volumineux est souvent un calvaire. Les connexions instables font échouer les uploads à mi-chemin. Les plateformes étrangères ne supportent pas le Mobile Money. Les limites de taille sont ridiculement basses pour des connexions souvent partagées.
              </p>
              <p>
                AfricaTransfer a été créé pour résoudre ces problèmes. Nous avons conçu une plateforme qui reprend automatiquement un upload interrompu, qui accepte MTN Mobile Money, Moov Money et Orange Money, et qui ne met pas de barrières inutiles devant vos transferts.
              </p>
              <p>
                Notre vision : que tout Africain puisse partager n'importe quel fichier avec n'importe qui, facilement, rapidement et en toute sécurité — qu'il soit à Cotonou, Lagos, Dakar ou Nairobi.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="divider mx-auto mb-6" />
              <h2 className="text-3xl font-semibold" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Nos valeurs</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Globe size={22} strokeWidth={1.5} style={{ color: '#C9972A' }} />,
                  title: 'Accessibilité',
                  desc: 'Aucun compte requis pour envoyer. Pas de carte bancaire nécessaire. Mobile Money accepté.',
                },
                {
                  icon: <Shield size={22} strokeWidth={1.5} style={{ color: '#C9972A' }} />,
                  title: 'Sécurité',
                  desc: 'Liens uniques, chiffrement, protection par mot de passe, expiration automatique.',
                },
                {
                  icon: <Zap size={22} strokeWidth={1.5} style={{ color: '#C9972A' }} />,
                  title: 'Résilience',
                  desc: 'Upload en chunks avec reprise automatique. Une coupure réseau ne ruine pas votre transfert.',
                },
                {
                  icon: <Heart size={22} strokeWidth={1.5} style={{ color: '#C9972A' }} />,
                  title: 'Simplicité',
                  desc: 'Une interface épurée, des actions claires. Le transfert de fichiers ne devrait pas être compliqué.',
                },
              ].map((v, i) => (
                <div key={i} className={`card card-hover p-6 animate-slide-up stagger-${i + 1}`}>
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center mb-4">{v.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="divider mx-auto mb-6" />
            <h2 className="text-3xl font-semibold mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Une question ? Un partenariat ?
            </h2>
            <p className="text-gray-500 mb-8">
              Nous sommes toujours disponibles pour échanger. Écrivez-nous ou essayez la plateforme gratuitement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:contact@africatransfer.com"
                className="btn-gold px-6 py-3 rounded-xl text-sm font-medium text-center flex items-center justify-center gap-2">
                Nous contacter
                <ArrowRight size={14} />
              </a>
              <Link href="/"
                className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all text-center">
                Essayer gratuitement
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
