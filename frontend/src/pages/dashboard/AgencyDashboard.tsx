const mockIncidents = [
  { id: 1, category: 'fire', status: 'pending_verification', severity: 3, location: 'Bole' },
  { id: 2, category: 'accident', status: 'submitted', severity: 2, location: 'CMC' },
]

export default function AgencyDashboard() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">GEORISE</p>
        <h1 className="text-2xl font-bold">Agency Dashboard</h1>
        <p className="text-slate-400 text-sm">Map placeholder + incident list.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded border border-slate-800 bg-slate-800/60 h-72 flex items-center justify-center text-slate-400">
          Map placeholder
        </div>
        <div className="rounded border border-slate-800 bg-slate-800/60 p-4 space-y-3">
          <h3 className="font-semibold">Incident Queue</h3>
          <div className="space-y-2">
            {mockIncidents.map((inc) => (
              <div
                key={inc.id}
                className="rounded border border-slate-700 bg-slate-900/50 p-3 flex justify-between"
              >
                <div>
                  <p className="font-semibold capitalize">{inc.category}</p>
                  <p className="text-xs text-slate-400">Location: {inc.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase px-2 py-1 rounded bg-slate-700 text-slate-200">
                    {inc.status}
                  </p>
                  <p className="text-xs text-slate-300 mt-1">Severity: {inc.severity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
