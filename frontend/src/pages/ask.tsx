import { useState } from "react"

export default function Ask() {
    const [q, setQ] = useState('')
    const [a, setA] = useState('')
  
    const ask = async () => {
      const res = await fetch(`http://localhost:3003/query?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      setA(json.answer)
    }
  
    return (
      <div>
        <h2>Ask your documents</h2>
        <input value={q} onChange={e => setQ(e.target.value)} />
        <button onClick={ask}>Ask</button>
        <p><strong>Answer:</strong> {a}</p>
      </div>
    )
  }
  