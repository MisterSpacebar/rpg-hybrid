// Pure reconciliation for editable Firestore snapshots.
// A live snapshot is authoritative when there are no local edits. If there are
// local edits, preserve them and explicitly report a remote revision conflict.
// Firestore returns map keys in sorted order, so a saved sheet must compare
// equal to the local draft regardless of key insertion order.
const canonical = (value) => {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, canonical(value[k])]))
  }
  return value
}
const signature = (value) => JSON.stringify(canonical(value))

export function acceptSnapshot(current, incoming) {
  const remoteSignature = signature(incoming)
  if (!current) return {
    value: incoming, remote: incoming, remoteSignature, dirty: false, conflict: false,
  }
  if (current.remoteSignature === remoteSignature) return current
  if (!current.dirty || signature(current.value) === remoteSignature) {
    return { value: incoming, remote: incoming, remoteSignature, dirty: false, conflict: false }
  }
  return { ...current, remote: incoming, remoteSignature, conflict: true }
}

export function editDraft(current, change) {
  if (!current) return current
  const value = typeof change === 'function' ? change(current.value) : { ...current.value, ...change }
  const dirty = signature(value) !== current.remoteSignature
  return { ...current, value, dirty, conflict: dirty && current.conflict }
}

export function discardDraft(current) {
  return current ? { ...current, value: current.remote, dirty: false, conflict: false } : current
}
