import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ImageIcon, CheckCircle, Clock, AlertCircle, Car, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Painel — AutoShowroom' }

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: stand } = await supabase
    .from('stands')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!stand) redirect('/auth')

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select(`
      id, make, model, year, price, status, created_at,
      vehicle_images(id, showroom_url, is_primary, processing_status)
    `)
    .eq('stand_id', stand.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const totalVehicles = vehicles?.length ?? 0
  const doneImages = vehicles?.reduce((acc, v) => {
    return acc + ((v.vehicle_images as any[])?.filter((i: any) => i.processing_status === 'done').length ?? 0)
  }, 0) ?? 0
  const pendingImages = vehicles?.reduce((acc, v) => {
    return acc + ((v.vehicle_images as any[])?.filter((i: any) => i.processing_status === 'pending' || i.processing_status === 'processing').length ?? 0)
  }, 0) ?? 0

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{stand.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">Painel de gestão de viaturas</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/upload">
            <Plus className="h-4 w-4 mr-2" /> Nova Viatura
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Viaturas', value: totalVehicles, icon: Car, color: 'text-primary' },
          { label: 'Fotos processadas', value: doneImages, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Em processamento', value: pendingImages, icon: Clock, color: 'text-yellow-400' },
          { label: 'Imagens usadas', value: `${stand.images_used_this_month}/${stand.images_limit === -1 ? '∞' : stand.images_limit}`, icon: TrendingUp, color: 'text-primary' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <Card key={i}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Listagem de viaturas */}
      <div>
        <h2 className="text-base font-semibold mb-4">As suas viaturas</h2>

        {!vehicles || vehicles.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="font-medium text-muted-foreground mb-4">Ainda não tem viaturas</p>
              <Button asChild>
                <Link href="/dashboard/upload">
                  <Plus className="h-4 w-4 mr-2" /> Adicionar primeira viatura
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map(vehicle => {
              const images = (vehicle.vehicle_images as any[]) ?? []
              const primaryImage = images.find((i: any) => i.is_primary) ?? images[0]
              const doneCount = images.filter((i: any) => i.processing_status === 'done').length
              const hasProcessing = images.some((i: any) => i.processing_status === 'processing')
              const hasError = images.some((i: any) => i.processing_status === 'error')

              return (
                <Link key={vehicle.id} href={`/dashboard/vehicles/${vehicle.id}`}>
                  <Card className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group">
                    {/* Preview */}
                    <div className="aspect-[16/9] bg-secondary flex items-center justify-center relative overflow-hidden">
                      {primaryImage?.showroom_url ? (
                        <img
                          src={primaryImage.showroom_url}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                      )}

                      {/* Status badge */}
                      <div className="absolute top-2 right-2">
                        {hasError ? (
                          <Badge variant="destructive" className="text-xs gap-1">
                            <AlertCircle className="h-3 w-3" /> Erro
                          </Badge>
                        ) : hasProcessing ? (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Clock className="h-3 w-3" /> A processar
                          </Badge>
                        ) : doneCount > 0 ? (
                          <Badge className="text-xs gap-1 bg-green-500/80">
                            <CheckCircle className="h-3 w-3" /> {doneCount} foto{doneCount !== 1 ? 's' : ''}
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.year ?? '—'} · {images.length} imagem{images.length !== 1 ? 'ns' : ''}
                          </p>
                        </div>
                        {vehicle.price && (
                          <p className="font-bold text-primary text-sm">
                            {Number(vehicle.price).toLocaleString('pt-PT')}€
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
