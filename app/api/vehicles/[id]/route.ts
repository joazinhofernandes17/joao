export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('vehicles')
    .select('*, vehicle_images(*, showroom_templates(name, slug, thumbnail_url))')
    .eq('id', params.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Viatura não encontrada' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('vehicles')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
