import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/auth-context'
import {
  Upload, User, LogOut, LayoutDashboard, Menu, X,
  ChevronDown, Star, FileText, Settings, Key
} from 'lucide-react'

export default function Navbar() {
  const { user, userData, logout } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100" style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255,255,255,0.95)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9972A, #E4B84A)' }}>
              <Upload size={16} className="text-white" />
            </div>
            <span className="font-display text-xl font-semibold" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Africa<span style={{ color: '#C9972A' }}>Transfer</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${router.pathname === '/' ? 'text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}>
              Envoyer
            </Link>
            <Link href="/pricing" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${router.pathname === '/pricing' ? 'text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}>
              Tarifs
            </Link>
            <Link href="/about" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${router.pathname === '/about' ? 'text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}>
              À propos
            </Link>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all text-sm"
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ background: 'linear-gradient(135deg, #C9972A, #E4B84A)' }}>
                    {(userData?.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-gray-700 max-w-24 truncate">
                    {userData?.displayName || user.email?.split('@')[0]}
                  </span>
                  {userData?.plan === 'premium' && (
                    <span className="badge-gold text-xs">Premium</span>
                  )}
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 card py-2 shadow-lg z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs text-gray-400">Connecté en tant que</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    </div>

                    <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <LayoutDashboard size={16} className="text-gray-400" />
                      Tableau de bord
                    </Link>

                    <Link href="/dashboard/transfers" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <FileText size={16} className="text-gray-400" />
                      Mes transferts
                    </Link>

                    {/* API — Premium uniquement */}
                    {userData?.plan === 'premium' && (
                      <Link href="/dashboard/api" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Key size={16} className="text-gray-400" />
                        API & Clés
                        <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full text-white" style={{ background: 'linear-gradient(135deg,#C9972A,#E4B84A)', fontSize: '10px' }}>
                          PRO
                        </span>
                      </Link>
                    )}

                    <Link href="/dashboard/settings" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Settings size={16} className="text-gray-400" />
                      Paramètres
                    </Link>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={16} />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors">
                  Connexion
                </Link>
                <Link href="/auth/register"
                  className="btn-gold px-4 py-2 text-sm rounded-lg">
                  Créer un compte
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            <Link href="/" onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Envoyer
            </Link>
            <Link href="/pricing" onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Tarifs
            </Link>
            <Link href="/about" onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              À propos
            </Link>
            {user && userData?.plan === 'premium' && (
              <Link href="/dashboard/api" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Key size={14} style={{ color: '#C9972A' }} />
                API & Clés
              </Link>
            )}
          </div>
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex gap-2">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">
                  Dashboard
                </Link>
                <button onClick={handleLogout}
                  className="flex-1 text-center px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">
                  Connexion
                </Link>
                <Link href="/auth/register" onClick={() => setMenuOpen(false)}
                  className="flex-1 btn-gold text-center px-4 py-2 text-sm rounded-lg">
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </nav>
  )
}