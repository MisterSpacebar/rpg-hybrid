import { useState } from 'react'

export default function PdfButton({ view }) {
  const [state, setState] = useState('idle')
  const [layout, setLayout] = useState('portrait')

  const download = async () => {
    setState('working')
    try {
      const { downloadArmyPdf } = await import('../builder/pdf.jsx')
      await downloadArmyPdf(view, { layout })
      setState('idle')
    } catch (err) {
      console.error(err)
      // A chunk that fails to load means this tab runs an older build than the one now hosted.
      setState(/dynamically imported module|Importing a module script failed|Loading chunk/i.test(String(err?.message ?? err)) ? 'stale' : 'error')
    }
  }

  return (
    <div className="pdf-controls">
      <label className="small muted">
        Datasheets{' '}
        <select value={layout} onChange={(e) => setLayout(e.target.value)}>
          <option value="portrait">3 per page (portrait)</option>
          <option value="landscape">4 per page (landscape)</option>
        </select>
      </label>
      <button className="primary" disabled={state === 'working'} onClick={download}>
        {state === 'working' ? 'Building PDF…' : 'Download PDF'}
      </button>
      {state === 'stale' && <span className="bad small">The site was updated since this page loaded. <button onClick={() => window.location.reload()}>Reload</button> and try again.</span>}
      {state === 'error' && <span className="bad small">Could not build the PDF (see console).</span>}
    </div>
  )
}