import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: stand } = await supabase.from('stands').select('id').eq('user_id', user.id).single()
  if (!stand) return NextResponse.json({ error: 'Stand não encontrado' }, { status: 404 })

  const { data, error } = await supabase
    .from('vehicles')
    .select(`
      *,
      vehicle_images(id, showroom_url, is_primary, processing_status, sort_order)
    `)
    .eq('stand_id', stand.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: stand } = await supabase.from('stands').select('id').eq('user_id', user.id).single()
  if (!stand) return NextResponse.json({ error: 'Stand não encontrado' }, { status: 404 })

  const body = await req.json()
  const { make, model, year, price, mileage, fuel_type, transmission, color, description } = body

  if (!make || !model) return NextResponse.json({ error: 'Marca e modelo obrigatórios' }, { status: 400 })

  const { data, error } = await supabase
    .from('vehicles')
    .insert({ stand_id: stand.id, make, model, year, price, mileage, fuel_type, transmission, color, description })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
