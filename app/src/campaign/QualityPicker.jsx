import { QUALITY_RULES, availableQualities, repairOptions, validateQualityPlan } from './qualityEngine.js'
import { ANTI_TAGS } from '../tags.js'

export default function QualityPicker({ item, data, roll, plan, setPlan, kind, repair, setRepair, magical = false }) {
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
