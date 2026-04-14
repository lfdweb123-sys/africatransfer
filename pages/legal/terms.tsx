import Head from 'next/head'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function Terms() {
  return (
    <>
      <Head><title>Conditions d'utilisation — AfricaTransfer</title></Head>
      <Navbar />
      <main className="pt-24 pb-0">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="divider mb-6" />
          <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Conditions d'utilisation
          </h1>
          <p className="text-gray-400 text-sm mb-10">Dernière mise à jour : Janvier 2025</p>

          <div className="space-y-8 text-gray-600 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptation des conditions</h2>
              <p>En utilisant AfricaTransfer, vous acceptez les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Description du service</h2>
              <p>AfricaTransfer est une plateforme de transfert de fichiers permettant d'envoyer et recevoir des fichiers via des liens de partage sécurisés. Le service est disponible en version gratuite et premium.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Utilisation acceptable</h2>
              <p>Il est strictement interdit d'utiliser AfricaTransfer pour :</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Partager du contenu illégal, pornographique ou offensant</li>
                <li>Distribuer des virus, malwares ou tout logiciel malveillant</li>
                <li>Violer les droits de propriété intellectuelle</li>
                <li>Harceler ou nuire à d'autres utilisateurs</li>
                <li>Contourner les limites techniques du service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Limites du service gratuit</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Taille maximale : 2 Go par transfert, 500 Mo par fichier</li>
                <li>Durée de conservation : 7 jours</li>
                <li>Pas d'accès à l'API publique</li>
                <li>Pas d'extension Chrome</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Plan Premium</h2>
              <p>Le plan Premium offre des capacités étendues. Le paiement est traité via FeexPay. En cas de non-renouvellement, le compte revient au plan gratuit et les fichiers excédant les limites gratuites sont supprimés.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Suppression automatique</h2>
              <p>Les fichiers sont automatiquement supprimés après expiration (7 jours gratuit, 1 an premium). AfricaTransfer n'est pas responsable de la perte de fichiers expirés. Nous vous recommandons de garder des copies de vos fichiers importants.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Limitation de responsabilité</h2>
              <p>AfricaTransfer est fourni "tel quel". Nous ne garantissons pas la disponibilité continue du service. Notre responsabilité est limitée au montant payé pour le service au cours des 30 derniers jours.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Modifications</h2>
              <p>Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications importantes seront notifiées par email. La continuité d'utilisation du service vaut acceptation des nouvelles conditions.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Contact</h2>
              <p>Pour toute question : <a href="mailto:legal@africatransfer.com" className="text-yellow-600 hover:underline">legal@africatransfer.com</a></p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
