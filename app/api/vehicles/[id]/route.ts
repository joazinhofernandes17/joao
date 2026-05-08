import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getStandId(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data } = await supabase.from('stands').select('id').eq('user_id', userId).single()
  return data?.id ?? null
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data, error } = await supabase
    .from('vehicles')
    .select(`
      *,
      vehicle_images(*, showroom_templates(name, slug, thumbnail_url))
    `)
    .eq('id', params.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Viatura não encontrada' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const standId = await getStandId(supabase, user.id)
  if (!standId) return NextResponse.json({ error: 'Stand não encontrado' }, { status: 404 })

  const body = await req.json()
  const { data, error } = await supabase
    .from('vehicles')
    .update(body)
    .eq('id', params.id)
    .eq('stand_id', standId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const standId = await getStandId(supabase, user.id)
  if (!standId) return NextResponse.json({ error: 'Stand não encontrado' }, { status: 404 })

  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', params.id)
    .eq('stand_id', standId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
