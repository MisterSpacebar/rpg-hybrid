import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase.js'

const AuthContext = createContext(null)

export const MAX_NAME = 40

const defaultName = (user) => (user.displayName || user.email?.split('@')[0] || 'Player').slice(0, MAX_NAME)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        setUser(u)
        setProfile(null)
        if (u) {
          try {
            const ref = doc(db, 'users', u.uid)
            const snap = await getDoc(ref)
            if (snap.exists()) {
              setProfile(snap.data())
            } else {
              // First sign-in: start with the Google name; the user can change it later.
              const created = { displayName: defaultName(u), createdAt: serverTimestamp() }
              await setDoc(ref, created)
              setProfile({ displayName: created.displayName })
            }
          } catch (err) {
            console.error(err)
            setError('Signed in, but your profile could not be loaded. Check that Firestore is enabled.')
            setProfile({ displayName: defaultName(u) })
          }
        }
        setLoading(false)
      }),
    [],
  )

  const signIn = useCallback(async () => {
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        console.error(err)
        setError(err.code === 'auth/operation-not-allowed' ? 'Google sign-in is not enabled for this project yet.' : 'Sign-in failed. Please try again.')
      }
    }
  }, [])

  const signOut = useCallback(() => fbSignOut(auth), [])

  const updateDisplayName = useCallback(
    async (name) => {
      const displayName = name.trim().slice(0, MAX_NAME)
      if (!user || !displayName) return
      await setDoc(doc(db, 'users', user.uid), { displayName, updatedAt: serverTimestamp() }, { merge: true })
      setProfile((p) => ({ ...p, displayName }))
    },
    [user],
  )

  const value = useMemo(
    () => ({ user, profile, loading, error, signIn, signOut, updateDisplayName }),
    [user, profile, loading, error, signIn, signOut, updateDisplayName],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
