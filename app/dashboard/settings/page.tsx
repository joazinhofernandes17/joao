'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Settings, Building2 } from 'lucide-react'
import type { Stand } from '@/types'

export default function SettingsPage() {
  const supabase = createClient()
  const [stand, setStand] = useState<Stand | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', address: '', website: '' })

  const set = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }))

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('stands').select('*').eq('user_id', user.id).single()
      if (data) {
        setStand(data)
        setForm({ name: data.name, phone: data.phone ?? '', address: data.address ?? '', website: data.website ?? '' })
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!stand) return
    setSaving(true)
    const { error } = await supabase
      .from('stands')
      .update({ name: form.name, phone: form.phone || null, address: form.address || null, website: form.website || null })
      .eq('id', stand.id)
    if (error) toast.error('Erro ao guardar: ' + error.message)
    else toast.success('Definições guardadas!')
    setSaving(false)
  }

  if (loading) return <div className="p-8 text-muted-foreground text-sm">A carregar...</div>

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">Definições do Stand</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Informações do Stand
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Stand *</Label>
              <Input id="name" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="+351 912 345 678" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Morada</Label>
              <Input id="address" placeholder="Rua Exemplo, 123, Lisboa" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" placeholder="https://www.meustand.pt" value={form.website} onChange={e => set('website', e.target.value)} />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'A guardar...' : 'Guardar definições'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Plano atual */}
      {stand && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plano atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Plano</span>
              <span className="font-semibold capitalize">{stand.subscription_tier}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Imagens usadas este mês</span>
              <span className="font-semibold">{stand.images_used_this_month}/{stand.images_limit === -1 ? '∞' : stand.images_limit}</span>
            </div>
            <div className="pt-2 border-t border-border">
              <Button variant="outline" className="w-full" disabled>
                Upgrade de plano — em breve
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">API de Exportação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Use o endpoint abaixo para exportar automaticamente as fotos processadas para o seu site ou DMS.
          </p>
          <div className="bg-secondary rounded-lg p-3 font-mono text-xs text-muted-foreground">
            GET /api/export?vehicleId=&#123;id&#125;
          </div>
          <p className="text-xs text-muted-foreground">
            Autenticação via cookie de sessão. Para integração servidor-a-servidor, contacte o suporte.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
