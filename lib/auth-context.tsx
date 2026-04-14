import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import { User } from './types'

interface AuthContextType {
  user: FirebaseUser | null
  userData: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// Appel centralisé de l'email de bienvenue — ne bloque jamais le flux
async function sendWelcome(email: string, name: string) {
  try {
    await fetch('/api/auth/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    })
    console.log(`[Welcome] Email envoyé à ${email}`)
  } catch (e) {
    // Non bloquant : l'inscription réussit même si l'email échoue
    console.error('[Welcome] Échec envoi email:', e)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchUserData(uid: string) {
    try {
      const snap = await getDoc(doc(db, 'users', uid))
      if (snap.exists()) {
        setUserData(snap.data() as User)
      }
    } catch (e) {
      console.error('Error fetching user data:', e)
    }
  }

  async function refreshUserData() {
    if (user) await fetchUserData(user.uid)
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await fetchUserData(firebaseUser.uid)
      } else {
        setUserData(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function signUp(email: string, password: string, name: string) {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(newUser, { displayName: name })
    await setDoc(doc(db, 'users', newUser.uid), {
      uid: newUser.uid,
      email,
      displayName: name,
      plan: 'free',
      createdAt: serverTimestamp(),
      storageUsed: 0,
      transferCount: 0,
    })
    // ✅ Email de bienvenue envoyé ici, dans signUp, pas dans le composant
    await sendWelcome(email, name)
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })

    try {
      const { user: googleUser } = await signInWithPopup(auth, provider)
      const snap = await getDoc(doc(db, 'users', googleUser.uid))

      const isNewUser = !snap.exists()

      if (isNewUser) {
        await setDoc(doc(db, 'users', googleUser.uid), {
          uid: googleUser.uid,
          email: googleUser.email,
          displayName: googleUser.displayName,
          plan: 'free',
          createdAt: serverTimestamp(),
          storageUsed: 0,
          transferCount: 0,
        })
        // ✅ Email de bienvenue uniquement pour les nouveaux comptes Google
        await sendWelcome(
          googleUser.email!,
          googleUser.displayName || 'Utilisateur'
        )
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Le popup a été bloqué. Autorisez les popups pour ce site.')
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Connexion annulée.')
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('Domaine non autorisé. Contactez le support.')
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Connexion annulée.')
      } else {
        throw new Error(`Erreur Google: ${error.code || error.message}`)
      }
    }
  }

  async function logout() {
    await signOut(auth)
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email)
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, signIn, signUp, signInWithGoogle, logout, resetPassword, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}