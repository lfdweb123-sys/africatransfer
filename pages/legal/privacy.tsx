import Head from 'next/head'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function Privacy() {
  return (
    <>
      <Head><title>Politique de confidentialité — AfricaTransfer</title></Head>
      <Navbar />
      <main className="pt-24 pb-0">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="divider mb-6" />
          <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Politique de confidentialité
          </h1>
          <p className="text-gray-400 text-sm mb-10">Dernière mise à jour : Janvier 2025</p>

          <div className="prose max-w-none space-y-8 text-gray-600 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Données collectées</h2>
              <p>Nous collectons les informations suivantes :</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Adresse email et nom lors de la création d'un compte</li>
                <li>Fichiers uploadés (stockés temporairement selon votre plan)</li>
                <li>Adresse IP lors des téléchargements (pour les notifications)</li>
                <li>Informations de paiement (traitées par FeexPay, non stockées chez nous)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Utilisation des données</h2>
              <p>Vos données sont utilisées pour :</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Fournir le service de transfert de fichiers</li>
                <li>Envoyer des notifications de téléchargement</li>
                <li>Gérer votre abonnement Premium</li>
                <li>Améliorer nos services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Conservation des données</h2>
              <p>Les fichiers sont supprimés automatiquement :</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Plan Gratuit :</strong> 7 jours après l'upload</li>
                <li><strong>Plan Premium :</strong> 1 an après l'upload</li>
              </ul>
              <p className="mt-2">Vous pouvez supprimer vos fichiers manuellement depuis votre tableau de bord.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Sécurité</h2>
              <p>Nous utilisons Firebase (Google) pour le stockage et l'authentification. Les fichiers sont stockés de manière sécurisée avec des URLs signées à durée limitée. Les mots de passe de protection sont hashés avec bcrypt.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Partage des données</h2>
              <p>Nous ne vendons jamais vos données. Nous utilisons les services tiers suivants :</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Firebase / Google :</strong> Authentification et stockage</li>
                <li><strong>Brevo :</strong> Envoi d'emails transactionnels</li>
                <li><strong>FeexPay :</strong> Traitement des paiements Mobile Money</li>
                <li><strong>Vercel :</strong> Hébergement de l'application</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Vos droits</h2>
              <p>Vous avez le droit de :</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Accéder à vos données personnelles</li>
                <li>Supprimer votre compte et toutes vos données</li>
                <li>Exporter vos données</li>
              </ul>
              <p className="mt-2">Pour exercer ces droits, contactez-nous à <a href="mailto:privacy@africatransfer.com" className="text-yellow-600 hover:underline">privacy@africatransfer.com</a></p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Contact</h2>
              <p>Pour toute question concernant cette politique : <a href="mailto:privacy@africatransfer.com" className="text-yellow-600 hover:underline">privacy@africatransfer.com</a></p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
