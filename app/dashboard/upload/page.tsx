'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Upload, X, Car, ImageIcon } from 'lucide-react'

const FUEL_TYPES = ['gasolina', 'gasóleo', 'híbrido', 'elétrico', 'gpl']
const TRANSMISSIONS = ['manual', 'automático']

export default function UploadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [form, setForm] = useState({
    make: '', model: '', year: '', price: '', mileage: '',
    fuel_type: '', transmission: '', color: '', description: '',
  })

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const valid = Array.from(newFiles).filter(f => f.type.startsWith('image/'))
    setFiles(prev => [...prev, ...valid].slice(0, 20))
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.make || !form.model) { toast.error('Marca e modelo são obrigatórios'); return }
    if (files.length === 0) { toast.error('Adicione pelo menos uma foto'); return }

    setLoading(true)
    try {
      // 1. Criar viatura
      const vehicleRes = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: form.make,
          model: form.model,
          year: form.year ? parseInt(form.year) : null,
          price: form.price ? parseFloat(form.price) : null,
          mileage: form.mileage ? parseInt(form.mileage) : null,
          fuel_type: form.fuel_type || null,
          transmission: form.transmission || null,
          color: form.color || null,
          description: form.description || null,
        }),
      })

      if (!vehicleRes.ok) {
        const err = await vehicleRes.json()
        throw new Error(err.error)
      }

      const vehicle = await vehicleRes.json()

      // 2. Upload de cada ficheiro
      const uploadPromises = files.map(async (file, idx) => {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('vehicleId', vehicle.id)
        fd.append('isPrimary', idx === 0 ? 'true' : 'false')

        const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error)
        }
        return res.json()
      })

      await Promise.all(uploadPromises)

      toast.success('Viatura criada! Agora configure o showroom virtual.')
      router.push(`/dashboard/vehicles/${vehicle.id}`)
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro ao criar viatura')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Nova Viatura</h1>
        <p className="text-muted-foreground text-sm mt-1">Preencha os dados e carregue as fotos</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados da viatura */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="h-4 w-4" /> Dados da viatura
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Marca *</Label>
              <Input id="make" placeholder="BMW" value={form.make} onChange={e => set('make', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo *</Label>
              <Input id="model" placeholder="Série 3" value={form.model} onChange={e => set('model', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Ano</Label>
              <Input id="year" type="number" placeholder="2022" min="1900" max="2030" value={form.year} onChange={e => set('year', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço (€)</Label>
              <Input id="price" type="number" placeholder="24900" min="0" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Quilómetros</Label>
              <Input id="mileage" type="number" placeholder="45000" min="0" value={form.mileage} onChange={e => set('mileage', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <Input id="color" placeholder="Preto" value={form.color} onChange={e => set('color', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel_type">Combustível</Label>
              <select
                id="fuel_type"
                value={form.fuel_type}
                onChange={e => set('fuel_type', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecione</option>
                {FUEL_TYPES.map(f => <option key={f} value={f} className="capitalize">{f}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transmission">Transmissão</Label>
              <select
                id="transmission"
                value={form.transmission}
                onChange={e => set('transmission', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecione</option>
                {TRANSMISSIONS.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                placeholder="Descrição da viatura, extras, estado..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Upload de fotos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Fotos da viatura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop zone */}
            <div
              className={`upload-zone p-10 text-center cursor-pointer ${dragging ? 'drag-over' : ''}`}
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium text-sm mb-1">Arraste fotos ou clique para selecionar</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, WEBP · Máx. 20 fotos · A IA melhora automaticamente para 2K+</p>
              <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files && addFiles(e.target.files)}
              />
            </div>

            {/* Previews */}
            {files.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {files.map((file, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-secondary border border-border">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    {idx === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-xs text-center py-0.5">
                        Principal
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setFiles(f => f.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={loading} size="lg">
          {loading ? 'A criar viatura...' : 'Criar viatura e configurar showroom'}
        </Button>
      </form>
    </div>
  )
}
