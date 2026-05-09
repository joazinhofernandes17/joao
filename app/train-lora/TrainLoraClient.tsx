'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type SetupStep = 'fetch_images' | 'build_zip' | 'upload_zip' | 'start_training'
type StepStatus = 'pending' | 'running' | 'done' | 'error'
type TrainingStatus = 'none' | 'processing' | 'succeeded' | 'failed' | 'canceled'

interface StepState {
  status: StepStatus
  message: string
  extra?: Record<string, unknown>
}

const SETUP_STEPS: { key: SetupStep; label: string; desc: string }[] = [
  { key: 'fetch_images',   label: 'Pesquisa Unsplash',  desc: '18 imagens de estúdio automóvel' },
  { key: 'build_zip',      label: 'Comprime dataset',   desc: 'Download + ZIP das imagens' },
  { key: 'upload_zip',     label: 'Upload dataset',     desc: 'Envia ZIP para Supabase Storage' },
  { key: 'start_training', label: 'Inicia treino',      desc: 'ostris/flux-dev-lora-trainer no Replicate' },
]

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  standId: string
  standName: string
  initialPrimaryColor: string
  initialTrainingStatus: TrainingStatus
  initialTrainingId: string | null
  initialModelVersion: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 20_000

function statusIcon(s: StepStatus) {
  if (s === 'pending') return <span className="w-5 h-5 rounded-full border-2 border-zinc-700 inline-block" />
  if (s === 'running') return <SpinnerIcon />
  if (s === 'done')    return <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[11px]">✓</span>
  return <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[11px]">✕</span>
}

function SpinnerIcon() {
  return (
    <svg className="w-5 h-5 animate-spin text-amber-400" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  )
}

function PulseRing() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TrainLoraClient({
  standId, standName,
  initialPrimaryColor,
  initialTrainingStatus,
  initialTrainingId,
  initialModelVersion,
}: Props) {
  const [primaryColor, setPrimaryColor]         = useState(initialPrimaryColor)
  const [phase, setPhase]                       = useState<'idle' | 'setup' | 'training' | 'done' | 'error'>(
    initialTrainingStatus === 'processing' ? 'training'
    : initialTrainingStatus === 'succeeded' ? 'done'
    : initialTrainingStatus === 'failed' || initialTrainingStatus === 'canceled' ? 'error'
    : 'idle'
  )
  const [steps, setSteps]                       = useState<Record<SetupStep, StepState>>({
    fetch_images:   { status: 'pending', message: '' },
    build_zip:      { status: 'pending', message: '' },
    upload_zip:     { status: 'pending', message: '' },
    start_training: { status: 'pending', message: '' },
  })
  const [trainingId, setTrainingId]             = useState<string | null>(initialTrainingId)
  const [trainingStatus, setTrainingStatus]     = useState<TrainingStatus>(initialTrainingStatus)
  const [modelVersion, setModelVersion]         = useState<string | null>(initialModelVersion)
  const [errorMsg, setErrorMsg]                 = useState('')
  const [elapsed, setElapsed]                   = useState(0)
  const [lastPoll, setLastPoll]                 = useState<Date | null>(null)

  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const trainingStart = useRef<number | null>(null)

  // ── Polling ──────────────────────────────────────────────────────────────
  const pollStatus = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/train-lora?trainingId=${id}`)
      const data = await res.json()
      setLastPoll(new Date())
      setTrainingStatus(data.status)

      if (data.status === 'succeeded') {
        setModelVersion(data.modelVersion ?? null)
        setPhase('done')
        stopPolling()
      } else if (data.status === 'failed' || data.status === 'canceled') {
        setErrorMsg(data.error ?? 'Treino falhou no Replicate')
        setPhase('error')
        stopPolling()
      }
    } catch {
      // silent — will retry
    }
  }, [])

  const stopPolling = useCallback(() => {
    if (pollTimer.current)   clearInterval(pollTimer.current)
    if (elapsedTimer.current) clearInterval(elapsedTimer.current)
    pollTimer.current = null
    elapsedTimer.current = null
  }, [])

  const startPolling = useCallback((id: string) => {
    trainingStart.current = Date.now()
    pollTimer.current = setInterval(() => pollStatus(id), POLL_INTERVAL_MS)
    elapsedTimer.current = setInterval(() => {
      if (trainingStart.current)
        setElapsed(Math.floor((Date.now() - trainingStart.current) / 1000))
    }, 1000)
    pollStatus(id)
  }, [pollStatus])

  // Auto-start polling if we resumed with a training in progress
  useEffect(() => {
    if (initialTrainingStatus === 'processing' && initialTrainingId) {
      startPolling(initialTrainingId)
    }
    return stopPolling
  }, [])

  // ── Setup SSE ────────────────────────────────────────────────────────────
  const startTraining = useCallback(async () => {
    setPhase('setup')
    setErrorMsg('')
    setSteps({
      fetch_images:   { status: 'pending', message: '' },
      build_zip:      { status: 'pending', message: '' },
      upload_zip:     { status: 'pending', message: '' },
      start_training: { status: 'pending', message: '' },
    })

    try {
      const res = await fetch('/api/train-lora/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ standId, standName, primaryColor }),
      })

      if (!res.body) throw new Error('Sem resposta do servidor')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })

        const parts = buf.split('\n\n')
        buf = parts.pop() ?? ''

        for (const part of parts) {
          const line = part.replace(/^data: /, '').trim()
          if (!line) continue
          try {
            const evt = JSON.parse(line)

            if (evt.step === 'error') {
              setErrorMsg(evt.message)
              setPhase('error')
              return
            }

            if (SETUP_STEPS.some(s => s.key === evt.step)) {
              setSteps(prev => ({
                ...prev,
                [evt.step]: { status: evt.status, message: evt.message, extra: evt },
              }))

              if (evt.step === 'start_training' && evt.status === 'done' && evt.trainingId) {
                const id = evt.trainingId as string
                setTrainingId(id)
                setTrainingStatus('processing')
                setPhase('training')
                startPolling(id)
              }
            }
          } catch { /* ignore malformed */ }
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Erro desconhecido')
      setPhase('error')
    }
  }, [standId, standName, primaryColor, startPolling])

  // ── UI helpers ───────────────────────────────────────────────────────────
  const fmtElapsed = (s: number) => {
    const m = Math.floor(s / 60)
    const ss = s % 60
    return m > 0 ? `${m}m ${ss}s` : `${ss}s`
  }

  const estimatedTotal = 18 * 60 // 18 min estimate
  const progressPct = phase === 'training'
    ? Math.min(Math.round((elapsed / estimatedTotal) * 100), 95)
    : phase === 'done' ? 100 : 0

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0c0c10] text-zinc-100 p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">⬡</span>
            <h1 className="text-2xl font-semibold tracking-tight">Treino LoRA Personalizado</h1>
          </div>
          <p className="text-zinc-400 text-sm ml-9">
            Treina um modelo FLUX exclusivo para <span className="text-zinc-200 font-medium">{standName}</span> com imagens reais de estúdio automóvel.
            Custo aproximado: <span className="text-amber-400">~$2</span> · Duração: <span className="text-amber-400">~15-20 min</span>
          </p>
        </div>

        {/* Config card — só mostra quando idle ou erro */}
        {(phase === 'idle' || phase === 'error') && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">Configuração</h2>

            {/* Color picker */}
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Cor primária do stand</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border-2 border-zinc-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  maxLength={7}
                  className="w-28 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-zinc-500"
                />
                <span className="text-xs text-zinc-500">Usada nos prompts gerados para personalizar o showroom</span>
              </div>
            </div>

            {/* Dataset info */}
            <div className="rounded-xl bg-zinc-800/60 border border-zinc-700/50 p-4 space-y-2">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Dataset de treino</p>
              <ul className="text-sm text-zinc-300 space-y-1">
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> 18 imagens de estúdio automóvel profissional (Unsplash)</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Plataformas circulares, iluminação softbox, chão epoxy</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Legendas automáticas via autocaption</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Trigger word: <code className="text-amber-300 bg-zinc-700 px-1 rounded">AUTOSTUDIO</code></li>
              </ul>
            </div>

            {/* Error */}
            {phase === 'error' && errorMsg && (
              <div className="rounded-xl bg-red-950/40 border border-red-800/50 p-4 text-sm text-red-300">
                <p className="font-semibold mb-1">Erro</p>
                <p className="font-mono text-xs">{errorMsg}</p>
              </div>
            )}

            <button
              onClick={startTraining}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors"
            >
              {phase === 'error' ? 'Tentar novamente' : 'Iniciar Treino LoRA'}
            </button>
          </div>
        )}

        {/* Setup steps */}
        {(phase === 'setup' || (phase === 'training') || (phase === 'done' && steps.start_training.status === 'done')) && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">Preparação do dataset</h2>
            <div className="space-y-3">
              {SETUP_STEPS.map(({ key, label, desc }) => {
                const step = steps[key]
                return (
                  <div key={key} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">{statusIcon(step.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${step.status === 'pending' ? 'text-zinc-500' : step.status === 'error' ? 'text-red-400' : 'text-zinc-200'}`}>
                          {label}
                        </span>
                        {step.status === 'pending' && (
                          <span className="text-xs text-zinc-600">{desc}</span>
                        )}
                      </div>
                      {step.message && step.status !== 'pending' && (
                        <p className={`text-xs mt-0.5 ${step.status === 'error' ? 'text-red-400' : 'text-zinc-400'}`}>
                          {step.message}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Training in progress */}
        {phase === 'training' && (
          <div className="rounded-2xl border border-amber-800/40 bg-amber-950/20 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PulseRing />
                <h2 className="text-sm font-semibold text-amber-300">Treino a decorrer no Replicate</h2>
              </div>
              <span className="text-xs text-zinc-500 font-mono">{fmtElapsed(elapsed)}</span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-1000"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-600">
                <span>~{progressPct}% concluído</span>
                <span>Estimativa: 15-20 min</span>
              </div>
            </div>

            <div className="rounded-xl bg-zinc-800/50 border border-zinc-700/40 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>ID do treino</span>
                <span className="font-mono text-xs text-zinc-500 truncate max-w-48">{trainingId}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Estado Replicate</span>
                <span className="text-amber-400 font-medium capitalize">{trainingStatus}</span>
              </div>
              {lastPoll && (
                <div className="flex justify-between text-zinc-400">
                  <span>Última verificação</span>
                  <span className="text-zinc-500 text-xs">{lastPoll.toLocaleTimeString()}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-zinc-500 text-center">
              Podes fechar esta página — o treino continua no Replicate. Volta aqui para ver o resultado.
            </p>
          </div>
        )}

        {/* Success */}
        {phase === 'done' && (
          <div className="rounded-2xl border border-emerald-800/40 bg-emerald-950/20 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">✓</span>
              <div>
                <h2 className="text-sm font-semibold text-emerald-300">Treino concluído com sucesso!</h2>
                <p className="text-xs text-zinc-400">O modelo personalizado de {standName} está pronto</p>
              </div>
            </div>

            {modelVersion && (
              <div className="rounded-xl bg-zinc-800/50 border border-zinc-700/40 p-4 space-y-2 text-sm">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Modelo treinado</p>
                <p className="font-mono text-xs text-emerald-400 break-all">{modelVersion}</p>
              </div>
            )}

            <div className="rounded-xl bg-zinc-800/60 border border-zinc-700/50 p-4 space-y-2">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Como usar</p>
              <ul className="text-sm text-zinc-300 space-y-1">
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Próximas imagens usarão este modelo automaticamente</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Trigger word <code className="text-amber-300 bg-zinc-700 px-1 rounded">AUTOSTUDIO</code> activa o estilo</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Cor <span className="inline-block w-3 h-3 rounded-full border border-zinc-500" style={{ backgroundColor: primaryColor }} /> <code className="text-zinc-300">{primaryColor}</code> incluída nos prompts</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <a
                href="/test-pipeline"
                className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm text-center transition-colors"
              >
                Testar pipeline
              </a>
              <a
                href="/dashboard"
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm text-center transition-colors"
              >
                Ir para o painel
              </a>
            </div>
          </div>
        )}

        {/* Info footer */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Pipeline de geração</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500">
            <div className="flex items-start gap-2">
              <span className="text-zinc-600 mt-0.5">1.</span>
              <span><span className="text-zinc-400">Unsplash API</span> — 18 fotos de estúdio automóvel</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-zinc-600 mt-0.5">2.</span>
              <span><span className="text-zinc-400">JSZip</span> — comprime dataset para upload</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-zinc-600 mt-0.5">3.</span>
              <span><span className="text-zinc-400">ostris/flux-dev-lora-trainer</span> — 1000 steps, rank 16</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-zinc-600 mt-0.5">4.</span>
              <span><span className="text-zinc-400">FLUX + LoRA</span> — geração com trigger <code className="text-amber-400">AUTOSTUDIO</code></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
