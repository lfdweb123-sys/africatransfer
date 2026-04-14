import Link from 'next/link'
import { Upload, Twitter, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ background: "#0F0F0F" }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9972A, #E4B84A)' }}>
                <Upload size={16} className="text-white" />
              </div>
              <span className="font-display text-xl" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Africa<span style={{ color: '#C9972A' }}>Transfer</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              La plateforme de transfert de fichiers conçue pour l'Afrique. Simple, rapide, sécurisé.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-9 h-9 rounded-lg border border-gray-800 flex items-center justify-center text-gray-400 hover:border-yellow-600 hover:text-yellow-500 transition-colors">
                <Twitter size={15} />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg border border-gray-800 flex items-center justify-center text-gray-400 hover:border-yellow-600 hover:text-yellow-500 transition-colors">
                <Linkedin size={15} />
              </a>
              <a href="mailto:contact@africatransfer.com" className="w-9 h-9 rounded-lg border border-gray-800 flex items-center justify-center text-gray-400 hover:border-yellow-600 hover:text-yellow-500 transition-colors">
                <Mail size={15} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Produit</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors">Envoyer des fichiers</Link></li>
              <li><Link href="/pricing" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors">Tarifs</Link></li>
              <li><Link href="/dashboard" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors">Tableau de bord</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Entreprise</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors">À propos</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors">Contact</Link></li>
              <li><a href="mailto:support@africatransfer.com" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Légal</h3>
            <ul className="space-y-3">
              <li><Link href="/legal/privacy" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors">Politique de confidentialité</Link></li>
              <li><Link href="/legal/terms" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors">Conditions d'utilisation</Link></li>
              <li><Link href="/legal/cookies" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} AfricaTransfer. Tous droits réservés.
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Fait avec ❤️ pour l'Afrique
          </p>
        </div>
      </div>
    </footer>
  )
}