const normalize = (value) => {
  if (Array.isArray(value)) return value.map(normalize).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((k) => [k, normalize(value[k])]))
  return value ?? null
}

// Two formations are interchangeable when they share a profile, size and upgrades; ids, notes and drafted slot don't matter.
export function unitSignature(item) {
  const c = item.config ?? {}
  return JSON.stringify(normalize({ key: c.key, factionId: item.factionId ?? null, models: c.models, doubled: !!c.doubled, picks: c.picks ?? {} }))
}

export function groupRoster(items) {
  const groups = new Map()
  for (const item of items) {
    const sig = unitSignature(item)
    if (!groups.has(sig)) groups.set(sig, { signature: sig, items: [] })
    groups.get(sig).items.push(item)
  }
  return [...groups.values()]
}

// Which PC has each formation drafted: formationId -> { uid, slot }. The viewer's own unsaved draft takes precedence.
export function holdersOf(detachments, viewerUid, viewerSelections) {
  const holders = new Map()
  for (const d of detachments) {
    if (d.ownerUid === viewerUid) continue
    for (const s of d.selections ?? []) holders.set(s.id, { uid: d.ownerUid, slot: s.slot })
  }
  for (const s of viewerSelections ?? []) holders.set(s.id, { uid: viewerUid, slot: s.slot })
  return holders
}
