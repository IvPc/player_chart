import { useState, useEffect } from 'react'
import { Users, Trash2, Search, Plus, RefreshCw } from 'lucide-react'

const API_BASE_URL = 'http://playerchartapi-env.eba-jzxqtkyi.ap-southeast-2.elasticbeanstalk.com/api/player-chart'

function App() {
  const [playerChart, setPlayerChart] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [addForm, setAddForm] = useState({ position: '', player: '', positionDepth: '' })
  const [removeForm, setRemoveForm] = useState({ position: '', player: '' })
  const [backupsForm, setBackupsForm] = useState({ position: '', player: '' })
  const [backupsResult, setBackupsResult] = useState([])

  useEffect(() => {
    fetchPlayerChart()
  }, [])

  const fetchPlayerChart = async () => {
    try {
      setLoading(true)
      const response = await fetch(API_BASE_URL)
      const data = await response.json()
      setPlayerChart(data.playerChart || {})
      setError('')
    } catch (err) {
      setError('Failed to fetch depth chart')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlayer = async () => {
    try {
      setLoading(true)
      const body = {
        position: addForm.position,
        player: addForm.player,
        positionDepth: addForm.positionDepth ? parseInt(addForm.positionDepth) : null
      }

      const response = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        setSuccess(`${addForm.player} added to ${addForm.position}`)
        setAddForm({ position: '', player: '', positionDepth: '' })
        await fetchPlayerChart()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to add player')
      }
    } catch (err) {
      setError('Error adding player')
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePlayer = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(removeForm)
      })

      const data = await response.json()
      if (response.ok && data.player.length > 0) {
        setSuccess(`${data.player[0]} removed from ${removeForm.position}`)
        setRemoveForm({ position: '', player: '' })
        await fetchPlayerChart()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Player not found')
        setTimeout(() => setError(''), 3000)
      }
    } catch (err) {
      setError('Error removing player')
    } finally {
      setLoading(false)
    }
  }

  const handleGetBackups = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/backups?position=${encodeURIComponent(backupsForm.position)}&player=${encodeURIComponent(backupsForm.player)}`
      )

      const data = await response.json()
      setBackupsResult(data.backups || [])
      if (data.backups.length === 0) {
        setError('No backups found or player not in depth chart')
        setTimeout(() => setError(''), 3000)
      }
    } catch (err) {
      setError('Error fetching backups')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Users className="w-10 h-10 text-indigo-600" />
            NFL Player Chart Manager
          </h1>
          <p className="text-gray-600">Manage your team depth chart</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Add Player
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  placeholder="e.g., QB, WR, RB"
                  value={addForm.position}
                  onChange={(e) => setAddForm({ ...addForm, position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Player Name</label>
                <input
                  type="text"
                  placeholder="e.g., Tom Brady"
                  value={addForm.player}
                  onChange={(e) => setAddForm({ ...addForm, player: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position Depth (optional)</label>
                <input
                  type="number"
                  placeholder="Leave empty to add at end"
                  value={addForm.positionDepth}
                  onChange={(e) => setAddForm({ ...addForm, positionDepth: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <button
                onClick={handleAddPlayer}
                disabled={loading || !addForm.position || !addForm.player}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                Add Player
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Remove Player
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  placeholder="e.g., QB"
                  value={removeForm.position}
                  onChange={(e) => setRemoveForm({ ...removeForm, position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Player Name</label>
                <input
                  type="text"
                  placeholder="e.g., Tom Brady"
                  value={removeForm.player}
                  onChange={(e) => setRemoveForm({ ...removeForm, player: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleRemovePlayer}
                disabled={loading || !removeForm.position || !removeForm.player}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                Remove Player
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Get Backups
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  placeholder="e.g., QB"
                  value={backupsForm.position}
                  onChange={(e) => setBackupsForm({ ...backupsForm, position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Player Name</label>
                <input
                  type="text"
                  placeholder="e.g., Tom Brady"
                  value={backupsForm.player}
                  onChange={(e) => setBackupsForm({ ...backupsForm, player: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleGetBackups}
                disabled={loading || !backupsForm.position || !backupsForm.player}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                Get Backups
              </button>
            </div>

            {backupsResult.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Backups:</h3>
                <ul className="space-y-1">
                  {backupsResult.map((backup, idx) => (
                    <li key={idx} className="text-gray-600">
                      {idx + 1}. {backup}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              Full Player Chart
            </h2>
            <button
              onClick={fetchPlayerChart}
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {Object.keys(playerChart).length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No players in depth chart. Add some players to get started!
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(playerChart).map(([position, players]) => (
                <div key={position} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <h3 className="text-lg font-bold text-indigo-600 mb-3 pb-2 border-b border-gray-200">
                    {position}
                  </h3>
                  <ol className="space-y-2">
                    {players.map((player, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                          {idx + 1}
                        </span>
                        <span className="text-gray-700">{player}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App