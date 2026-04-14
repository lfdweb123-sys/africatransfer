import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../lib/auth-context'
import Navbar from '../../components/Navbar'
import { db } from '../../lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { User, Settings, Lock, Star, CheckCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import Link from 'next/link'
 
export default function SettingsPage() {
  const { user, userData, loading, refreshUserData } = useAuth()
  const router = useRouter()
 
  const [name, setName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
 
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
 
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirect=/dashboard/settings')
    }
  }, [user, loading, router])
 
  useEffect(() => {
    if (userData) {
      setName(userData.displayName || user?.displayName || '')
    }
  }, [userData, user])
 
  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Le nom ne peut pas être vide')
      return
    }
 
    const currentUser = auth.currentUser
    if (!currentUser || !user) {
      toast.error('Utilisateur non connecté')
      return
    }
 
    setSavingProfile(true)
    try {
      await updateProfile(currentUser, { displayName: name.trim() })
      await setDoc(
        doc(db, 'users', user.uid),
        { displayName: name.trim() },
        { merge: true }
      )
      await refreshUserData()
      toast.success('Profil mis à jour')
    } catch (err: any) {
      console.error('saveProfile error:', err)
      toast.error(err?.message || 'Erreur de mise à jour')
    } finally {
      setSavingProfile(false)
    }
  }
 
  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
 
    if (newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit faire au moins 6 caractères')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
 
    const currentUser = auth.currentUser
    if (!currentUser || !user?.email) {
      toast.error('Utilisateur non connecté')
      return
    }
 
    setSavingPassword(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(currentUser, credential)
      await updatePassword(currentUser, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Mot de passe modifié avec succès')
    } catch (err: any) {
      console.error('changePassword error:', err)
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        toast.error('Mot de passe actuel incorrect')
      } else if (err?.code === 'auth/too-many-requests') {
        toast.error('Trop de tentatives. Réessayez plus tard.')
      } else {
        toast.error(err?.message || 'Erreur de modification')
      }
    } finally {
      setSavingPassword(false)
    }
  }
 
  if (loading || !user) return null
 
  const isGoogleUser = user.providerData?.[0]?.providerId === 'google.com'
 
  const formatDate = (val: any) => {
    if (!val) return '—'
    try {
      let d: Date
      if (typeof val?.toDate === 'function') {
        d = val.toDate()                          // Firestore Timestamp
      } else if (typeof val === 'number') {
        d = new Date(val)                         // Unix ms
      } else if (typeof val === 'string') {
        d = new Date(val)                         // ISO string
      } else if (val instanceof Date) {
        d = val
      } else {
        return '—'
      }
      if (isNaN(d.getTime())) return '—'
      return format(d, 'd MMMM yyyy', { locale: fr })
    } catch {
      return '—'
    }
  }
 
  return (
    <>
      <Head>
        <title>Paramètres — AfricaTransfer</title>
      </Head>
      <Navbar />
 
      <div className="pt-16 min-h-screen" style={{ background: '#FAFAFA' }}>
        <div className="max-w-2xl mx-auto px-4 py-10">
 
          {/* Header */}
          <div className="mb-8">
            <p className="text-sm text-gray-400 mb-1">Tableau de bord</p>
            <h1
              className="text-2xl font-semibold"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Paramètres
            </h1>
          </div>
 
          {/* Plan info */}
          <div
            className={`rounded-2xl p-5 mb-6 ${
              userData?.plan === 'premium' ? 'bg-black' : 'card'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#C9972A,#E4B84A)' }}
                >
                  <Star size={18} className="text-white" />
                </div>
                <div>
                  <p
                    className={`font-semibold ${
                      userData?.plan === 'premium' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Plan {userData?.plan === 'premium' ? 'Premium' : 'Gratuit'}
                  </p>
                  <p
                    className={`text-xs ${
                      userData?.plan === 'premium' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {userData?.plan === 'premium'
                      ? userData?.planExpiresAt
                        ? `Expire le ${formatDate(userData.planExpiresAt)}`
                        : 'Actif'
                      : 'Passez Premium pour plus de fonctionnalités'}
                  </p>
                </div>
              </div>
              {userData?.plan !== 'premium' && (
                <Link href="/pricing" className="btn-gold px-4 py-2 rounded-lg text-sm">
                  Passer Premium
                </Link>
              )}
            </div>
          </div>
 
          {/* Profile */}
          <div className="card p-6 mb-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center">
                <User size={18} style={{ color: '#C9972A' }} />
              </div>
              <h2 className="font-semibold text-gray-900">Profil</h2>
            </div>
 
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Nom affiché
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Adresse email
                </label>
                <input
                  type="email"
                  className="input-field bg-gray-100 cursor-not-allowed"
                  value={user.email || ''}
                  readOnly
                />
                <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié.</p>
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                className="btn-gold px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {savingProfile ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle size={14} />
                )}
                Sauvegarder
              </button>
            </form>
          </div>
 
          {/* Password — email users only */}
          {!isGoogleUser && (
            <div className="card p-6 mb-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center">
                  <Lock size={18} style={{ color: '#C9972A' }} />
                </div>
                <h2 className="font-semibold text-gray-900">Mot de passe</h2>
              </div>
 
              <form onSubmit={changePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    required
                    className="input-field"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="input-field"
                    placeholder="Minimum 6 caractères"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="input-field"
                    placeholder="Répétez le mot de passe"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="btn-gold px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {savingPassword ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Lock size={14} />
                  )}
                  Modifier le mot de passe
                </button>
              </form>
            </div>
          )}
 
          {/* Account info */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center">
                <Settings size={18} style={{ color: '#C9972A' }} />
              </div>
              <h2 className="font-semibold text-gray-900">Informations du compte</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-400">Membre depuis</span>
                <span className="text-gray-700">{formatDate(userData?.createdAt)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-400">Plan actuel</span>
                <span className="text-gray-700 capitalize">{userData?.plan || 'free'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Connexion via</span>
                <span className="text-gray-700">
                  {isGoogleUser ? 'Google' : 'Email / Mot de passe'}
                </span>
              </div>
            </div>
          </div>
 
        </div>
      </div>
    </>
  )
}