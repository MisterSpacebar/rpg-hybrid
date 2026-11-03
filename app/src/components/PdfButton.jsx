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
      setState('error')
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
      {state === 'error' && <span className="bad small">Could not build the PDF (see console).</span>}
    </div>
  )
}