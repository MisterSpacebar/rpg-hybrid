import { useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'

export function SignInButton({ className = 'primary', label = 'Sign in with Google' }) {
  const { signIn } = useAuth()
  return (
    <button className={className} onClick={signIn}>
      {label}
    </button>
  )
}

export default function UserMenu() {
  const { user, profile, loading, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  if (loading) return <span className="muted small">…</span>
  if (!user) return <SignInButton className="signin" />

  const name = profile?.displayName ?? user.displayName ?? 'Player'
  return (
    <div className="user-menu">
      <button className="user-chip" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {user.photoURL && <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />}
        <span>{name}</span>
      </button>
      {open && (
        <div className="user-pop" onClick={() => setOpen(false)}>
          <a href="#/library">My Library &amp; Profile</a>
          <button onClick={signOut}>Sign out</button>
        </div>
      )}
    </div>
  )
}
