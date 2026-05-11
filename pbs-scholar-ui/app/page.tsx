'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <span className="text-xl font-bold">PBS Scholar</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/dashboard" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition">
              Start Analysis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <h1 className="text-6xl md:text-7xl font-black mb-6">
            Metacognitive <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Research Suite
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Analyze human-AI interaction patterns, measure metacognitive depth (IKO), and generate publication-ready research reports.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-bold text-lg transition transform hover:scale-105">
              Open Dashboard →
            </Link>
            <button className="px-8 py-4 border-2 border-blue-400 hover:border-blue-300 rounded-lg font-bold transition">
              Read Methodology
            </button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-3xl mx-auto relative z-10"
        >
          {[
            { icon: '📈', label: '4+ Research Hypotheses', value: 'Pre-registered' },
            { icon: '🎯', label: 'IKO Metric', value: 'Novel measure' },
            { icon: '🔬', label: 'Publication-Ready', value: '30+ session dataset' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-4 backdrop-blur"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-sm font-bold text-blue-300">{stat.label}</div>
              <div className="text-xs text-gray-400">{stat.value}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-16">Research Capabilities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '📂', title: 'Session Upload', desc: 'Import JSONL session data from multiple sources' },
              { icon: '🏷️', title: 'Annotation Tools', desc: 'Code interactions as Type A, B, or C artifacts' },
              { icon: '📊', title: 'Statistical Analysis', desc: 'Pre-registered hypothesis testing & correlations' },
              { icon: '🧠', title: 'IKO Calculation', desc: 'Metacognitive completeness scoring' },
              { icon: '📝', title: 'Report Generation', desc: 'Publication-quality research reports' },
              { icon: '🔐', title: 'Data Privacy', desc: 'GDPR-compliant session management' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-8 hover:bg-blue-600/20 transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-12">Research Framework</h2>
          <div className="space-y-6">
            {[
              { title: 'H1: Type A > Type C', desc: 'Sessions dominated by Type A artifacts achieve higher outcome scores than Type C dominant sessions' },
              { title: 'H2: IKO Correlation', desc: 'IKO per session positively correlates with outcome score (r > 0.4, p < 0.05)' },
              { title: 'H3: Brain Lag Effect', desc: 'In sessions >30 turns, % Type A drops in turns 21-30 vs turns 1-10' },
              { title: 'H4: Domain Knowledge', desc: 'Higher % Type A in experienced domains vs novel domains' },
            ].map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-6 hover:bg-blue-600/20 transition"
              >
                <h3 className="font-bold text-lg text-blue-300 mb-2">{h.title}</h3>
                <p className="text-gray-400 text-sm">{h.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-4xl font-black mb-6">Ready to conduct research?</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Upload your data, annotate sessions, and generate publication-ready research reports
        </p>
        <Link href="/dashboard" className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-bold text-lg transition">
          Get Started →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-500/20 bg-slate-950/50 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <p>© 2026 PBS Scholar. Research methodology by Flavell (1979), Veenman et al. (2006).</p>
        </div>
      </footer>
    </main>
  )
}
