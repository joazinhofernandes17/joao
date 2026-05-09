'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Download, Loader2, CheckCircle, AlertCircle, Clock,
  ImageIcon, Zap, RefreshCw, ChevronLeft, Eye
} from 'lucide-react'
import Link from 'next/link'
import type { Vehicle, VehicleImage, ShowroomTemplate } from '@/types'

const SHOWROOMS = [
  { slug: 'nova',    name: 'Nova',    tier: 'free',    gradient: 'from-gray-100 to-gray-200' },
  { slug: 'elise',   name: 'Elise',   tier: 'free',    gradient: 'from-slate-200 to-slate-300' },
  { slug: 'origin',  name: 'Origin',  tier: 'starter', gradient: 'from-stone-200 to-stone-300' },
  { slug: 'eclipse', name: 'Eclipse', tier: 'pro',     gradient: 'from-gray-700 to-gray-900' },
  { slug: 'horizon', name: 'Horizon', tier: 'pro',     gradient: 'from-orange-200 to-amber-300' },
]

const STATUS_CONFIG = {
  pending:    { label: 'Pendente',       icon: Clock,        color: 'text-muted-foreground' },
  processing: { label: 'A processar...', icon: Loader2,      color: 'text-yellow-400 animate-spin' },
  done:       { label: 'Pronto',         icon: CheckCircle,  color: 'text-green-400' },
  error:      { label: 'Erro',           icon: AlertCircle,  color: 'text-destructive' },
}

export default function VehiclePage() {
  const { id } = useParams<{ id: string }>()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<VehicleImage | null>(null)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [selectedShowroom, setSelectedShowroom] = useState('nova')
  const [processing, setProcessing] = useState<string | null>(null)

  async function fetchVehicle() {
    const res = await fetch(`/api/vehicles/${id}`)
    if (!res.ok) return
    const data = await res.json()
    setVehicle(data)

    const images: VehicleImage[] = data.vehicle_images ?? []
    if (images.length === 0) return

    // Sincroniza selectedImage com dados frescos, preservando a seleção actual
    setSelectedImageId(prev => {
      const targetId = prev ?? (images.find(i => i.is_primary) ?? images[0]).id
      const fresh = images.find(i => i.id === targetId) ?? images[0]
      setSelectedImage(fresh)
      return fresh.id
    })
  }

  useEffect(() => {
    fetchVehicle().finally(() => setLoading(false))
  }, [id])

  // Poll enquanto há imagens em processamento
  useEffect(() => {
    const hasProcessing = vehicle?.vehicle_images?.some(i => i.processing_status === 'processing')
    if (!hasProcessing) return
    const interval = setInterval(fetchVehicle, 3000)
    return () => clearInterval(interval)
  }, [vehicle])

  async function processImage(imageId: string) {
    setProcessing(imageId)
    try {
      const res = await fetch('/api/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleImageId: imageId, showroomSlug: selectedShowroom }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }

      toast.success('Imagem processada com sucesso!')
      await fetchVehicle()
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro no processamento')
    } finally {
      setProcessing(null)
    }
  }

  async function processAllPending() {
    const pending = vehicle?.vehicle_images?.filter(i => i.processing_status === 'pending' || i.processing_status === 'error') ?? []
    if (pending.length === 0) { toast.info('Não há imagens pendentes'); return }

    toast.info(`A processar ${pending.length} imagem${pending.length !== 1 ? 'ns' : ''}...`)
    for (const img of pending) {
      await processImage(img.id)
    }
  }

  function handleDownload(url: string) {
    const a = document.createElement('a')
    a.href = url
    a.download = `showroom-${vehicle?.make}-${vehicle?.model}.png`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Viatura não encontrada.</p>
        <Link href="/dashboard" className="text-primary text-sm hover:underline mt-2 block">← Voltar ao painel</Link>
      </div>
    )
  }

  const images = vehicle.vehicle_images ?? []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard"><ChevronLeft className="h-4 w-4 mr-1" /> Painel</Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{vehicle.make} {vehicle.model}</h1>
          <p className="text-sm text-muted-foreground">
            {vehicle.year ?? '—'} · {vehicle.mileage ? `${vehicle.mileage.toLocaleString('pt-PT')} km` : '—'} · {vehicle.fuel_type ?? '—'}
          </p>
        </div>
        {vehicle.price && (
          <p className="text-xl font-bold text-primary">{Number(vehicle.price).toLocaleString('pt-PT')}€</p>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Painel esquerdo: configuração */}
        <div className="space-y-4">
          {/* Seleção de imagem */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Fotos ({images.length})</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              {images.map(img => {
                const status = STATUS_CONFIG[img.processing_status]
                const StatusIcon = status.icon
                const isSelected = selectedImage?.id === img.id
                return (
                  <button
                    key={img.id}
                    onClick={() => { setSelectedImage(img); setSelectedImageId(img.id) }}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${isSelected ? 'border-primary' : 'border-border hover:border-primary/50'}`}
                  >
                    {img.showroom_url || img.original_url ? (
                      <img
                        src={img.showroom_url ?? img.original_url}
                        alt="viatura"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary">
                        <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="absolute bottom-0.5 right-0.5">
                      <StatusIcon className={`h-3.5 w-3.5 ${status.color}`} />
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          {/* Seleção de showroom */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Ambiente showroom</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {SHOWROOMS.map(s => (
                <button
                  key={s.slug}
                  onClick={() => setSelectedShowroom(s.slug)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg border transition-all ${selectedShowroom === s.slug ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                >
                  <div className="h-10 w-16 rounded overflow-hidden shrink-0 bg-secondary">
                    <img src={`/showrooms/${s.slug}-thumb.png`} alt={s.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{s.name}</p>
                    <Badge variant="secondary" className="text-xs capitalize">{s.tier}</Badge>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="space-y-2">
            {selectedImage && (
              <Button
                className="w-full"
                onClick={() => processImage(selectedImage.id)}
                disabled={processing === selectedImage.id || selectedImage.processing_status === 'processing'}
              >
                {processing === selectedImage.id ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> A processar...</>
                ) : (
                  <><Zap className="h-4 w-4 mr-2" /> Processar foto selecionada</>
                )}
              </Button>
            )}

            <Button variant="outline" className="w-full" onClick={processAllPending} disabled={!!processing}>
              <RefreshCw className="h-4 w-4 mr-2" /> Processar todas as pendentes
            </Button>
          </div>
        </div>

        {/* Painel direito: preview */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <div className="relative bg-secondary min-h-[400px] flex items-center justify-center">
              {selectedImage ? (
                <>
                  {selectedImage.processing_status === 'processing' ? (
                    <div className="text-center space-y-3">
                      <div className="w-full absolute inset-0 shimmer" />
                      <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                      <p className="text-sm text-muted-foreground">A processar imagem...</p>
                      <p className="text-xs text-muted-foreground">Upscale 2K+ → Remove fundo → Showroom virtual</p>
                    </div>
                  ) : selectedImage.showroom_url ? (
                    <img
                      src={selectedImage.showroom_url}
                      alt="Showroom virtual"
                      className="w-full h-full object-contain max-h-[500px]"
                    />
                  ) : selectedImage.original_url ? (
                    <div className="text-center">
                      <img
                        src={selectedImage.original_url}
                        alt="Original"
                        className="max-h-[400px] w-full object-contain opacity-60"
                      />
                      <p className="text-xs text-muted-foreground mt-2">Foto original — clique em "Processar" para gerar o showroom</p>
                    </div>
                  ) : (
                    <ImageIcon className="h-16 w-16 text-muted-foreground/20" />
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">Selecione uma foto à esquerda</p>
                </div>
              )}
            </div>
          </Card>

          {/* Barra de pipeline */}
          {selectedImage && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-xs">
                    {[
                      { label: 'Original', done: !!selectedImage.original_url },
                      { label: 'Upscale 2K+', done: !!selectedImage.enhanced_url },
                      { label: 'Sem fundo', done: !!selectedImage.nobg_url },
                      { label: 'Showroom', done: !!selectedImage.showroom_url },
                    ].map(({ label, done }, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${done ? 'bg-green-400' : 'bg-muted-foreground/30'}`} />
                        <span className={done ? 'text-green-400' : 'text-muted-foreground'}>{label}</span>
                      </div>
                    ))}
                  </div>

                  {selectedImage.showroom_url && (
                    <Button size="sm" variant="outline" onClick={() => handleDownload(selectedImage.showroom_url!)}>
                      <Download className="h-3.5 w-3.5 mr-1.5" /> Download
                    </Button>
                  )}
                </div>

                {selectedImage.processing_error && (
                  <div className="mt-3 flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-2">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{selectedImage.processing_error}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Galeria de thumbnails de resultado */}
          {images.some(i => i.showroom_url) && (
            <div>
              <p className="text-sm font-medium mb-3">Fotos prontas para exportar</p>
              <div className="grid grid-cols-4 gap-3">
                {images.filter(i => i.showroom_url).map(img => (
                  <div key={img.id} className="group relative aspect-video rounded-lg overflow-hidden border border-border">
                    <img
                      src={img.showroom_url!}
                      alt="showroom"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => { setSelectedImage(img); setSelectedImageId(img.id) }} title="Ver">
                        <Eye className="h-4 w-4 text-white" />
                      </button>
                      <button onClick={() => handleDownload(img.showroom_url!)} title="Download">
                        <Download className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
