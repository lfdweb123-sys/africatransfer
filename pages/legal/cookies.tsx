import Head from 'next/head'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Link from 'next/link'

export default function Cookies() {
  return (
    <>
      <Head>
        <title>Politique de cookies — AfricaTransfer</title>
        <meta name="description" content="Politique de cookies d'AfricaTransfer." />
      </Head>

      <Navbar />

      <main className="pt-24 pb-0">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="divider mb-6" />
          <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Politique de cookies
          </h1>
          <p className="text-gray-400 text-sm mb-10">Dernière mise à jour : Janvier 2025</p>

          <div className="space-y-8 text-gray-600 text-sm leading-relaxed">

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Qu'est-ce qu'un cookie ?</h2>
              <p>
                Un cookie est un petit fichier texte placé sur votre appareil (ordinateur, tablette, téléphone)
                lorsque vous visitez un site web. Les cookies permettent au site de mémoriser vos actions et
                préférences pendant une certaine période, afin que vous n'ayez pas à les ressaisir à chaque visite.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Cookies utilisés par AfricaTransfer</h2>
              <p className="mb-4">Nous utilisons uniquement des cookies essentiels au fonctionnement du service :</p>

              <div className="space-y-3">
                {[
                  {
                    name: 'Session d\'authentification',
                    type: 'Essentiel',
                    color: 'green',
                    duration: 'Session / 30 jours',
                    purpose: 'Maintenir votre connexion à votre compte. Sans ce cookie, vous seriez déconnecté à chaque page.',
                  },
                  {
                    name: 'Préférences utilisateur',
                    type: 'Fonctionnel',
                    color: 'blue',
                    duration: '1 an',
                    purpose: 'Mémoriser vos préférences d\'interface (langue, thème).',
                  },
                  {
                    name: 'Firebase Auth',
                    type: 'Essentiel',
                    color: 'green',
                    duration: '1 an',
                    purpose: 'Gérer l\'authentification sécurisée via Firebase (Google).',
                  },
                ].map((cookie, i) => (
                  <div key={i} className="card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900 text-sm">{cookie.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        cookie.color === 'green'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {cookie.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">Durée : {cookie.duration}</p>
                    <p className="text-sm text-gray-600">{cookie.purpose}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Cookies tiers</h2>
              <p className="mb-3">
                Nous utilisons des services tiers qui peuvent déposer leurs propres cookies :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Firebase / Google :</strong> Authentification et stockage de données.{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
                    className="text-yellow-600 hover:underline">
                    Voir la politique Google
                  </a>
                </li>
                <li>
                  <strong>Vercel :</strong> Hébergement et performance.{' '}
                  <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer"
                    className="text-yellow-600 hover:underline">
                    Voir la politique Vercel
                  </a>
                </li>
                <li>
                  <strong>UploadThing :</strong> Stockage des fichiers uploadés.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Ce que nous N'utilisons PAS</h2>
              <div className="p-4 rounded-xl border border-green-200" style={{ background: '#F0FDF4' }}>
                <ul className="space-y-2">
                  {[
                    'Cookies publicitaires ou de ciblage',
                    'Cookies de réseaux sociaux (Facebook Pixel, etc.)',
                    'Cookies de suivi comportemental',
                    'Partage de données avec des tiers à des fins commerciales',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-green-800">
                      <span className="text-green-500 font-bold">✓</span>
                      Aucun {item.toLowerCase()}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Gérer vos cookies</h2>
              <p className="mb-3">
                Vous pouvez contrôler et supprimer les cookies via les paramètres de votre navigateur :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
                <li><strong>Firefox :</strong> Paramètres → Vie privée et sécurité → Cookies</li>
                <li><strong>Safari :</strong> Préférences → Confidentialité</li>
                <li><strong>Edge :</strong> Paramètres → Cookies et autorisations de site</li>
              </ul>
              <div className="mt-4 p-3 rounded-lg border border-yellow-200 text-sm text-yellow-800"
                style={{ background: '#FFFBEB' }}>
                ⚠️ Désactiver les cookies essentiels empêchera la connexion à votre compte AfricaTransfer.
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Consentement</h2>
              <p>
                En utilisant AfricaTransfer, vous acceptez l'utilisation des cookies essentiels nécessaires
                au fonctionnement du service. Ces cookies ne nécessitent pas de consentement explicite car
                ils sont strictement indispensables à la fourniture du service demandé.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Contact</h2>
              <p>
                Pour toute question sur notre utilisation des cookies :{' '}
                <a href="mailto:privacy@africatransfer.com" className="text-yellow-600 hover:underline">
                  privacy@africatransfer.com
                </a>
              </p>
              <p className="mt-3">
                Consultez également notre{' '}
                <Link href="/legal/privacy" className="text-yellow-600 hover:underline">
                  politique de confidentialité
                </Link>{' '}
                et nos{' '}
                <Link href="/legal/terms" className="text-yellow-600 hover:underline">
                  conditions d'utilisation
                </Link>.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}