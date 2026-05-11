'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

const DEMO_SESSIONS = [
  { id: '1', date: '2026-05-11', operator: 'chief_protein', domain: 'trading', turns: 24, iko: 0.76, outcome: 'success' },
  { id: '2', date: '2026-05-10', operator: 'chief_protein', domain: 'security', turns: 18, iko: 0.62, outcome: 'partial' },
  { id: '3', date: '2026-05-09', operator: 'chief_protein', domain: 'writing', turns: 32, iko: 0.71, outcome: 'success' },
  { id: '4', date: '2026-05-08', operator: 'chief_protein', domain: 'architecture', turns: 28, iko: 0.84, outcome: 'success' },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showUploadModal, setShowUploadModal] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-blue-500/20 bg-slate-950/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black">📊 PBS Scholar Analysis</h1>
          <div className="flex gap-4">
            <button className="px-4 py-2 border border-blue-500/30 rounded-lg text-sm font-medium hover:border-blue-400 transition">
              ? Help
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition">
              Settings
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-12 border-b border-blue-500/20">
          {[
            { id: 'overview', label: '📈 Overview' },
            { id: 'sessions', label: '📝 Sessions' },
            { id: 'analysis', label: '🔬 Analysis' },
            { id: 'insights', label: '💡 Insights' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-300 font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '📁', label: 'Total Sessions', value: '34', color: 'from-blue-600 to-blue-700' },
                { icon: '🎯', label: 'Avg IKO', value: '0.71', color: 'from-cyan-600 to-cyan-700' },
                { icon: '✅', label: 'Success Rate', value: '73%', color: 'from-green-600 to-green-700' },
                { icon: '📊', label: 'Turns Analyzed', value: '847', color: 'from-purple-600 to-purple-700' },
              ].map((metric, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-gradient-to-br ${metric.color} bg-opacity-20 border border-current border-opacity-20 rounded-lg p-6`}
                >
                  <div className="text-3xl mb-3">{metric.icon}</div>
                  <p className="text-gray-400 text-sm mb-2">{metric.label}</p>
                  <p className="text-3xl font-black">{metric.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* IKO Distribution */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-6"
              >
                <h3 className="font-bold mb-6">IKO Score Distribution</h3>
                <div className="space-y-4">
                  {[
                    { range: '0.8-1.0', count: 12, pct: 35 },
                    { range: '0.6-0.79', count: 16, pct: 47 },
                    { range: '0.4-0.59', count: 5, pct: 15 },
                    { range: '0.0-0.39', count: 1, pct: 3 },
                  ].map((bin, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">{bin.range}</span>
                        <span className="text-sm font-bold">{bin.count} sessions</span>
                      </div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${bin.pct}%` }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Outcome Rate */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-6"
              >
                <h3 className="font-bold mb-6">Session Outcomes</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Successful', value: 25, color: 'bg-green-500', pct: 73 },
                    { label: 'Partial Success', value: 7, color: 'bg-yellow-500', pct: 21 },
                    { label: 'Failed', value: 2, color: 'bg-red-500', pct: 6 },
                  ].map((outcome, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">{outcome.label}</span>
                        <span className="text-sm font-bold">{outcome.value}</span>
                      </div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${outcome.pct}%` }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className={`h-3 ${outcome.color} rounded-full`}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* SESSIONS TAB */}
        {activeTab === 'sessions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Upload Button */}
            <motion.button
              onClick={() => setShowUploadModal(true)}
              whileHover={{ scale: 1.02 }}
              className="w-full p-8 border-2 border-dashed border-blue-500/50 rounded-lg hover:border-blue-400 transition flex flex-col items-center gap-4 group"
            >
              <span className="text-4xl group-hover:scale-125 transition">📥</span>
              <div>
                <h3 className="text-lg font-bold">Upload Session Data</h3>
                <p className="text-sm text-gray-400">JSONL format, 5+ turns minimum</p>
              </div>
            </motion.button>

            {/* Sessions Table */}
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-blue-500/20 bg-blue-600/5">
                  <tr className="text-sm text-gray-400 font-medium">
                    <th className="text-left px-6 py-4">Date</th>
                    <th className="text-left px-6 py-4">Domain</th>
                    <th className="text-left px-6 py-4">Turns</th>
                    <th className="text-left px-6 py-4">IKO</th>
                    <th className="text-left px-6 py-4">Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_SESSIONS.map((session, i) => (
                    <motion.tr
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-blue-500/10 hover:bg-blue-600/10 transition cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm">{session.date}</td>
                      <td className="px-6 py-4 text-sm font-medium">{session.domain}</td>
                      <td className="px-6 py-4 text-sm">{session.turns}</td>
                      <td className="px-6 py-4 text-sm font-bold text-cyan-300">{session.iko}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          session.outcome === 'success' ? 'bg-green-600/30 text-green-400' :
                          session.outcome === 'partial' ? 'bg-yellow-600/30 text-yellow-400' :
                          'bg-red-600/30 text-red-400'
                        }`}>
                          {session.outcome.charAt(0).toUpperCase() + session.outcome.slice(1)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ANALYSIS TAB */}
        {activeTab === 'analysis' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'H1: Type A > Type C', result: 'Supported', pval: 'p=0.023', color: 'border-green-500' },
                { title: 'H2: IKO Correlation', result: 'Supported', pval: 'r=0.56, p<0.001', color: 'border-green-500' },
                { title: 'H3: Brain Lag Effect', result: 'Partial', pval: 'p=0.067', color: 'border-yellow-500' },
                { title: 'H4: Domain Knowledge', result: 'Supported', pval: 'p=0.034', color: 'border-green-500' },
              ].map((hyp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`border-l-4 ${hyp.color} bg-blue-600/10 border-t border-r border-b border-blue-500/20 rounded-lg p-6`}
                >
                  <h3 className="font-bold mb-3">{hyp.title}</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-400">Result: </span>
                      <span className="font-bold text-cyan-300">{hyp.result}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Statistical: </span>
                      <span className="font-bold text-gray-300">{hyp.pval}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Correlation Matrix */}
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-6">
              <h3 className="font-bold mb-6">Variable Correlations</h3>
              <div className="space-y-3">
                {[
                  { var1: 'Type A %', var2: 'Outcome Score', corr: '0.56' },
                  { var1: 'IKO', var2: 'Outcome Score', corr: '0.51' },
                  { var1: 'Domain Experience', var2: 'Type A %', corr: '0.42' },
                  { var1: 'Session Length', var2: 'Brain Lag', corr: '-0.38' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                    <span className="text-sm">{row.var1} ↔ {row.var2}</span>
                    <span className="font-bold text-cyan-300">r={row.corr}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {[
              { icon: '💡', title: 'Key Finding: Type A Dominance', desc: 'Sessions with >60% Type A artifacts show 2.3x higher success rates than sessions <40% Type A' },
              { icon: '🧠', title: 'Brain Lag Detected', desc: 'Operators show declining metacognitive depth in sessions beyond 30 turns; recommend session length limit of 25-30 turns' },
              { icon: '🎯', title: 'Domain Effect', desc: 'Operators with documented experience in trading/architecture show 18% higher IKO scores than novel domains' },
              { icon: '⚠️', title: 'Data Gap Alert', desc: 'Security domain has only 4 sessions; need 8+ more for robust H2 testing' },
            ].map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-blue-600/10 border-l-4 border-l-cyan-500 border-t border-r border-b border-blue-500/20 rounded-lg p-6 hover:bg-blue-600/20 transition"
              >
                <div className="flex gap-4 items-start">
                  <span className="text-3xl">{insight.icon}</span>
                  <div>
                    <h3 className="font-bold mb-2 text-lg">{insight.title}</h3>
                    <p className="text-gray-400 text-sm">{insight.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Export */}
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-6">
              <h3 className="font-bold mb-4">Export & Share</h3>
              <div className="flex flex-wrap gap-3">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition">
                  📄 Export Report (PDF)
                </button>
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition">
                  📊 Download Dataset (CSV)
                </button>
                <button className="px-6 py-3 border border-blue-500/30 hover:border-blue-400 rounded-lg font-medium transition">
                  🔗 Generate Citation
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowUploadModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-blue-500/20 rounded-lg p-8 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-6">Upload Sessions</h2>

            <div className="space-y-4 mb-6">
              <div className="border-2 border-dashed border-blue-500/30 rounded-lg p-8 text-center">
                <div className="text-3xl mb-2">📁</div>
                <p className="text-sm text-gray-400">Drag JSONL files here or click to browse</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Or paste session data:</label>
                <textarea
                  placeholder='{"session_id": "...", "turns": [...]}'
                  rows={4}
                  className="w-full px-4 py-3 bg-blue-600/10 border border-blue-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 resize-none font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 py-3 border border-blue-500/20 rounded-lg font-bold hover:border-blue-400 transition"
              >
                Cancel
              </button>
              <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition">
                Upload
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
