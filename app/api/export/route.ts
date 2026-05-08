export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/export?vehicleId=xxx  — devolve URLs de todas as imagens processadas
export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const vehicleId = req.nextUrl.searchParams.get('vehicleId')
  if (!vehicleId) return NextResponse.json({ error: 'vehicleId obrigatório' }, { status: 400 })

  const { data: images, error } = await supabase
    .from('vehicle_images')
    .select('id, showroom_url, enhanced_url, nobg_url, view_angle, is_primary, processing_status')
    .eq('vehicle_id', vehicleId)
    .eq('processing_status', 'done')
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    vehicle_id: vehicleId,
    total: images?.length ?? 0,
    images: images?.map(img => ({
      id: img.id,
      view_angle: img.view_angle,
      is_primary: img.is_primary,
      showroom_url: img.showroom_url,
      enhanced_url: img.enhanced_url,
      nobg_url: img.nobg_url,
    })) ?? [],
  })
}
