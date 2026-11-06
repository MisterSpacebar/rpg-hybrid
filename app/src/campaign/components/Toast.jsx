import { useEffect, useState } from 'react'

// Floating status message so showing it never shifts the page layout.
export default function Toast({ message, kind = 'ok', ms = 6000 }) {
  const [hidden, setHidden] = useState(null)
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setHidden(message), ms)
    return () => clearTimeout(timer)
  }, [message, ms])
  if (!message || hidden === message) return null
  return <div className={`toast ${kind === 'ok' ? 'ok' : 'bad'}`} role="status" onClick={() => setHidden(message)} title="Click to dismiss">{message}</div>
}
