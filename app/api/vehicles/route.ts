export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createAdminClient()
  const standId = req.nextUrl.searchParams.get('standId')
  if (!standId) return NextResponse.json({ error: 'standId obrigatório' }, { status: 400 })

  const { data, error } = await supabase
    .from('vehicles')
    .select('*, vehicle_images(id, showroom_url, is_primary, processing_status, sort_order)')
    .eq('stand_id', standId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createAdminClient()
  const body = await req.json()
  const { standId, make, model, year, price, mileage, fuel_type, transmission, color, description } = body

  if (!standId) return NextResponse.json({ error: 'standId obrigatório' }, { status: 400 })
  if (!make || !model) return NextResponse.json({ error: 'Marca e modelo obrigatórios' }, { status: 400 })

  const { data, error } = await supabase
    .from('vehicles')
    .insert({ stand_id: standId, make, model, year, price, mileage, fuel_type, transmission, color, description })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
