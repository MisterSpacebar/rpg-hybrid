import { QUALITY_RULES, availableQualities, repairOptions, validateQualityPlan } from '../logic/qualityEngine.js'
import { ANTI_TAGS } from '../../tags.js'

export default function QualityPicker({ item, data, roll, plan, setPlan, kind, repair, setRepair, magical = false, automatic = false }) {
  if (!item || !data || !roll) return null
  if (kind === 'repair') {
    const options = repairOptions(item, data)
    return <div className="campaign-form">
      <label className="field">Restore one defect
        <select value={repair} onChange={(e) => setRepair(e.target.value)}>
          <option value="">Choose a defect…</option>
          {options.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      </label>
      {!roll.success && <p className="muted small">The repair check failed. No defect can be restored.</p>}
    </div>
  }
  if (!roll.success) return <p className="muted small">The check failed: no permanent Qualities can be added.</p>
  if (automatic) {
    let calculated = null
    let error = ''
    const needsAnti = plan.some((p) => p.id === 'specialized' && !p.choice)
    if (!needsAnti) {
      try { calculated = validateQualityPlan(item, data, roll, plan, { magical }) }
      catch (e) { error = e.message }
    }
    return <div className="panel">
      <h3>Generated crafting Boons</h3>
      <p className="muted small">The item automatically gains compatible improvements from its check. Excess successes buy eligible ranks, while a Surge may unlock an exceptional Quality. All non-Anti choices are fixed.</p>
      {!plan.length && <p className="muted small">No compatible Boons were generated for this check.</p>}
      {plan.map((row, index) => {
        const q = QUALITY_RULES[row.id]
        return <div className="campaign-form" key={row.id}>
          <div><strong>{q.name} {row.ranks}</strong>
            <div className="muted small">{q.exceptional ? 'Exceptional Surge Boon' : 'Crafting Boon'}
              {row.id === 'warded' ? ` · ${row.choice === 'magic' ? 'Magic' : 'Physical'} Ward` : ''}</div>
          </div>
          {row.id === 'specialized' && <label className="field">Choose Anti-type target
            <select value={row.choice || ''} onChange={(e) => setPlan((prev) => prev.map((entry, i) =>
              i === index ? { ...entry, choice: e.target.value } : entry))}>
              <option value="">Choose a canonical Tag…</option>
              {ANTI_TAGS.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          </label>}
        </div>
      })}
      <p role="status" className={needsAnti || error ? 'bad small' : 'muted small'}>
        {needsAnti ? 'Select the Anti-type target before confirming.' :
          error || `Generated ${plan.length} named Boon(s) · Spent ${calculated?.spent ?? 0} of ${roll.qualities} excess successes · +${calculated?.addedPoints ?? 0} equipment Points`}
      </p>
    </div>
  }

  const options = availableQualities(item, data)
  let calculated, error = ''
  try {
    calculated = validateQualityPlan(item, data, roll, plan, { magical })
  } catch (e) { error = e.message }
  const change = (index, patch) => setPlan((list) => list.map((x,i) => i === index ? { ...x,...patch } : x))
  return <div className="panel">
    <h3>Spend excess successes</h3>
    <p className="muted small">Available: {roll.qualities} excess successes · {roll.surges ? 'Surge: one exceptional Quality unlocked' : 'No Surge'}. Each improvement increases battlefield Points independently of Gold spent.</p>
    {plan.map((row,index) => {
      const q = QUALITY_RULES[row.id]
      return <div key={index} className="campaign-form">
        <label className="field">Quality
          <select value={row.id} onChange={(e) => change(index, { id:e.target.value, ranks:1, choice:'' })}>
            {options.map((id) => <option key={id} value={id}>{QUALITY_RULES[id].name}{QUALITY_RULES[id].exceptional ? ' · Surge' : ''}</option>)}
          </select>
        </label>
        <label className="field">Ranks
          <select value={row.ranks} onChange={(e) => change(index,{ranks:Number(e.target.value)})}>
            {Array.from({length:q.max},(_,i)=>i+1).map((i)=><option key={i} value={i}>{i}</option>)}
          </select>
        </label>
        {q.choice && <label className="field">{q.choice === 'tag' ? 'Target Tag' : 'Ward type'}
          {q.choice === 'ward' ? <select value={row.choice ?? ''} onChange={(e) => change(index,{choice:e.target.value})}>
            <option value="">Choose…</option><option value="physical">Physical</option><option value="magic">Magic</option>
          </select> : <select value={row.choice ?? ''} onChange={(e)=>change(index,{choice:e.target.value})}>
            <option value="">Choose target Tag…</option>{ANTI_TAGS.map((tag)=><option key={tag} value={tag}>{tag}</option>)}
          </select>}
        </label>}
        <button onClick={()=>setPlan((list)=>list.filter((_,i)=>i!==index))}>Remove</button>
      </div>
    })}
    <button disabled={plan.length >= 3 || !options.length} onClick={() => setPlan((list) => [
      ...list, { id: options.find((id) => !list.some((p) => p.id === id)) ?? options[0], ranks:1, choice:'' },
    ])}>Add Quality</button>
    <p role="status" className={error ? 'bad small' : 'muted small'}>
      {error || `Spent ${calculated?.spent ?? 0} of ${roll.qualities} excess successes · +${calculated?.addedPoints ?? 0} equipment Points`}
    </p>
  </div>
}
