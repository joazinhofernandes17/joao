'use client'

import { useState, useCallback, useRef } from 'react'

const ENVIRONMENTS = [
  { slug: 'nova',    name: 'Nova',    desc: 'Estúdio branco', tier: 'Grátis',  bg: 'radial-gradient(ellipse 130% 90% at 48% 42%, #ffffff 0%, #ececf2 55%, #d8d8e0 100%)' },
  { slug: 'elise',   name: 'Elise',   desc: 'Escuro premium', tier: 'Grátis',  bg: 'radial-gradient(ellipse 130% 90% at 48% 38%, #2a2d3e 0%, #1a1c2e 45%, #0e101c 100%)' },
  { slug: 'origin',  name: 'Origin',  desc: 'Tons aquecidos', tier: 'Starter', bg: 'radial-gradient(ellipse 130% 90% at 48% 42%, #f5efe4 0%, #e8dfc8 50%, #d0c8b0 100%)' },
  { slug: 'eclipse', name: 'Eclipse', desc: 'Preto dramático', tier: 'Pro',     bg: 'radial-gradient(ellipse 130% 90% at 48% 35%, #16182a 0%, #0a0c16 50%, #050508 100%)' },
  { slug: 'horizon', name: 'Horizon', desc: 'Pôr do sol',      tier: 'Pro',     bg: 'radial-gradient(ellipse 130% 90% at 48% 38%, #ffe0b0 0%, #ffb060 45%, #e07030 100%)' },
]

const PIPELINE_STEPS = [
  { key: 'upload',     label: 'Upload',            icon: '⬆' },
  { key: 'upscale',   label: 'Real-ESRGAN 4×',     icon: '✦' },
  { key: 'enhance',   label: 'Sharp Polish',        icon: '◈' },
  { key: 'remove_bg', label: 'remove.bg',           icon: '✂' },
  { key: 'composite', label: 'FLUX + Composite',    icon: '⬡' },
  { key: 'done',      label: 'Concluído',           icon: '✓' },
]

type StepStatus = 'pending' | 'running' | 'done' | 'skipped' | 'error'

interface StepState {
  status: StepStatus
  message: string
  url?: string
  ts?: number
}

interface DoneResult {
  originalUrl: string
  enhancedUrl: string
  nobgUrl: string
  showroomUrl: string
  finalWidth: number
  finalHeight: number
}

const statusColors: Record<StepStatus, string> = {
  pending: 'text-white/20',
  running: 'text-[#1e78ff]',
  done:    'text-emerald-400',
  skipped: 'text-white/35',
  error:   'text-red-400',
}

const statusBg: Record<StepStatus, string> = {
  pending: 'bg-white/5 border-white/8',
  running: 'bg-[#0d1629] border-[#1e78ff]/50',
  done:    'bg-[#0a1f12] border-emerald-500/40',
  skipped: 'bg-white/3 border-white/6',
  error:   'bg-[#1f0a0a] border-red-500/40',
}

export default function TestPipelinePage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [showroom, setShowroom] = useState('nova')
  const [dragging, setDragging] = useState(false)
  const [running, setRunning] = useState(false)
  const [steps, setSteps] = useState<Record<string, StepState>>({})
  const [result, setResult] = useState<DoneResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeResult, setActiveResult] = useState<'showroom' | 'nobg' | 'enhanced'>('showroom')
  const inputRef = useRef<HTMLInputElement>(null)

  const setStep = (key: string, state: Partial<StepState>) =>
    setSteps(s => ({ ...s, [key]: { ...s[key], status: 'pending', message: '', ...state } }))

  const pickFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setSteps({})
    setResult(null)
    setError(null)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) pickFile(f)
  }, [pickFile])

  async function runPipeline() {
    if (!file || running) return
    setRunning(true)
    setResult(null)
    setError(null)

    // Reset all steps to pending
    const initial: Record<string, StepState> = {}
    PIPELINE_STEPS.forEach(s => { initial[s.key] = { status: 'pending', message: '' } })
    setSteps(initial)

    const fd = new FormData()
    fd.append('file', file)
    fd.append('showroom', showroom)

    try {
      const res = await fetch('/api/test-pipeline', { method: 'POST', body: fd })
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const evt = JSON.parse(line.slice(6))
            const { step, status, message, url, ...rest } = evt

            if (step === 'error') {
              setError(message)
              break
            }

            if (step === 'done') {
              setStep('done', { status: 'done', message })
              setResult(rest as DoneResult)
            } else {
              setStep(step, { status, message, url })
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (err: any) {
      setError(err?.message ?? 'Erro desconhecido')
    } finally {
      setRunning(false)
    }
  }

  const elapsed = (ts?: number) => ts
    ? `${((Date.now() - ts) / 1000).toFixed(1)}s`
    : ''

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/8 px-6 py-4 flex items-center gap-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e78ff]">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M19 17H5a2 2 0 01-2-2V9a2 2 0 012-2h2l2-2h6l2 2h2a2 2 0 012 2v6a2 2 0 01-2 2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        <div>
          <span className="font-bold text-sm">Auto<span className="text-[#1e78ff]">Showroom</span></span>
          <span className="ml-3 text-xs text-white/30 font-mono border border-white/10 rounded px-2 py-0.5">
            Pipeline Test
          </span>
        </div>
        <div className="ml-auto text-xs text-white/20">
          Real-ESRGAN · remove.bg · FLUX-schnell
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 grid lg:grid-cols-[380px_1fr] gap-8 items-start">

        {/* ─── Left panel: config ─── */}
        <div className="space-y-5">

          {/* Drop zone */}
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">
              1 · Imagem do carro
            </p>
            <div
              className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
                dragging ? 'border-[#1e78ff] bg-[#0d1629]' : 'border-white/12 bg-white/2 hover:border-white/25 hover:bg-white/4'
              }`}
              style={{ minHeight: 160 }}
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f) }}
              />

              {preview ? (
                <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 160 }}>
                  <img src={preview} alt="Preview" className="w-full object-cover rounded-2xl" style={{ maxHeight: 200 }} />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
                    <span className="text-sm font-semibold">Trocar imagem</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-3xl mb-3 text-white/20">⬆</div>
                  <p className="text-sm font-semibold text-white/50">Arraste uma foto ou clique</p>
                  <p className="text-xs text-white/25 mt-1">JPG, PNG, WEBP</p>
                </div>
              )}
            </div>
            {file && (
              <p className="text-xs text-white/30 mt-2 px-1">
                {file.name} · {Math.round(file.size / 1024)} KB
              </p>
            )}
          </div>

          {/* Environment */}
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">
              2 · Ambiente de showroom
            </p>
            <div className="space-y-1.5">
              {ENVIRONMENTS.map(e => (
                <button
                  key={e.slug}
                  onClick={() => setShowroom(e.slug)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-150 text-left ${
                    showroom === e.slug
                      ? 'border-[#1e78ff]/50 bg-[#0d0d1e]'
                      : 'border-white/6 bg-[#0a0a0a] hover:border-white/14'
                  }`}
                >
                  <div className="h-8 w-12 rounded-lg shrink-0 overflow-hidden" style={{ background: e.bg }} />
                  <div className="flex-1 min-w-0">
                    <span className={`font-semibold text-sm ${showroom === e.slug ? 'text-white' : 'text-white/50'}`}>
                      {e.name}
                    </span>
                    <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wider text-[#1e78ff]/60 border border-[#1e78ff]/25 rounded-full px-1.5">
                      {e.tier}
                    </span>
                    <p className="text-xs text-white/25 truncate">{e.desc}</p>
                  </div>
                  {showroom === e.slug && <div className="h-1.5 w-1.5 rounded-full bg-[#1e78ff] shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Run button */}
          <button
            onClick={runPipeline}
            disabled={!file || running}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
              !file || running
                ? 'bg-white/5 text-white/25 cursor-not-allowed'
                : 'bg-[#1e78ff] text-white hover:bg-[#3b8fff] shadow-[0_0_24px_rgba(30,120,255,0.35)]'
            }`}
          >
            {running ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                A processar...
              </span>
            ) : '▶  Correr Pipeline'}
          </button>
        </div>

        {/* ─── Right panel: progress + results ─── */}
        <div className="space-y-6">

          {/* Steps tracker */}
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">
              Progresso do pipeline
            </p>
            <div className="space-y-2">
              {PIPELINE_STEPS.map((s, idx) => {
                const state = steps[s.key]
                const status: StepStatus = state?.status ?? 'pending'
                return (
                  <div
                    key={s.key}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 ${statusBg[status]}`}
                  >
                    {/* Step icon / spinner */}
                    <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border ${
                      status === 'running'  ? 'border-[#1e78ff] bg-[#1e78ff]/20 text-[#1e78ff]' :
                      status === 'done'     ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' :
                      status === 'skipped'  ? 'border-white/12 text-white/30' :
                      status === 'error'    ? 'border-red-500/50 bg-red-500/10 text-red-400' :
                      'border-white/8 text-white/20'
                    }`}>
                      {status === 'running' ? (
                        <span className="h-3 w-3 rounded-full border-2 border-[#1e78ff]/30 border-t-[#1e78ff] animate-spin" />
                      ) : (
                        <span>{s.icon}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${statusColors[status]}`}>
                          {s.label}
                        </span>
                        {status === 'skipped' && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-white/25 border border-white/12 rounded-full px-1.5">
                            ignorado
                          </span>
                        )}
                      </div>
                      {state?.message && (
                        <p className="text-xs text-white/35 mt-0.5 truncate">{state.message}</p>
                      )}
                    </div>

                    {/* URL chip */}
                    {state?.url && status === 'done' && (
                      <a
                        href={state.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-[10px] font-bold text-[#1e78ff] border border-[#1e78ff]/25 rounded-full px-2 py-0.5 hover:bg-[#1e78ff]/10 transition-colors"
                        onClick={e => e.stopPropagation()}
                      >
                        ver →
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[#1f0a0a] border border-red-500/30 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-400 mb-1">Erro no pipeline</p>
              <p className="text-xs text-red-300/70 font-mono break-all">{error}</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">
                Resultado · {result.finalWidth}×{result.finalHeight}px
              </p>

              {/* Tabs */}
              <div className="flex gap-1 mb-3">
                {([
                  { key: 'showroom', label: 'Showroom final' },
                  { key: 'nobg',     label: 'Sem fundo' },
                  { key: 'enhanced', label: 'Melhorada' },
                ] as const).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveResult(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeResult === tab.key
                        ? 'bg-[#1e78ff] text-white'
                        : 'bg-white/5 text-white/40 hover:bg-white/8 hover:text-white/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Image viewer */}
              <div className="relative rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/8"
                   style={{
                     backgroundImage: activeResult === 'nobg'
                       ? 'linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111 75%), linear-gradient(-45deg, transparent 75%, #111 75%)'
                       : undefined,
                     backgroundSize: activeResult === 'nobg' ? '20px 20px' : undefined,
                     backgroundPosition: activeResult === 'nobg' ? '0 0, 0 10px, 10px -10px, -10px 0px' : undefined,
                   }}
              >
                <img
                  src={
                    activeResult === 'showroom' ? result.showroomUrl :
                    activeResult === 'nobg'     ? result.nobgUrl :
                    result.enhancedUrl
                  }
                  alt="Resultado"
                  className="w-full object-contain"
                  style={{ maxHeight: 520 }}
                />
              </div>

              {/* Download buttons */}
              <div className="flex gap-2 mt-3">
                <a
                  href={result.showroomUrl}
                  download="showroom.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-[#1e78ff] text-white text-sm font-bold text-center hover:bg-[#3b8fff] transition-all"
                >
                  ↓ Download Showroom
                </a>
                <a
                  href={result.nobgUrl}
                  download="nobg.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 rounded-xl bg-white/8 text-white/60 text-sm font-bold text-center hover:bg-white/12 transition-all"
                >
                  ↓ Sem fundo
                </a>
              </div>

              {/* URLs table */}
              <div className="mt-4 rounded-xl bg-white/3 border border-white/6 overflow-hidden">
                <table className="w-full text-xs">
                  <tbody>
                    {[
                      { label: 'Original',  url: result.originalUrl },
                      { label: 'Enhanced',  url: result.enhancedUrl },
                      { label: 'No BG',     url: result.nobgUrl },
                      { label: 'Showroom',  url: result.showroomUrl },
                    ].map(row => (
                      <tr key={row.label} className="border-b border-white/5 last:border-0">
                        <td className="px-3 py-2 text-white/30 font-semibold w-20 shrink-0">{row.label}</td>
                        <td className="px-3 py-2">
                          <a
                            href={row.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1e78ff]/70 hover:text-[#1e78ff] truncate block font-mono"
                            style={{ maxWidth: 420 }}
                          >
                            {row.url}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Idle state */}
          {!running && !result && !error && Object.keys(steps).length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4 opacity-10">⬡</div>
              <p className="text-sm text-white/25">
                Selecione uma imagem e um ambiente, depois clique em Correr Pipeline.
              </p>
              <p className="text-xs text-white/15 mt-2">
                O pipeline executa: Real-ESRGAN → remove.bg → FLUX → composite
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
