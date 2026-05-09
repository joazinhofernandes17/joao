export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TrainLoraClient from './TrainLoraClient'

export default async function TrainLoraPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: stand } = await supabase
    .from('stands')
    .select('id, name, primary_color, lora_training_id, lora_training_status, lora_model_version, lora_trigger_word')
    .eq('user_id', user.id)
    .single()

  if (!stand) redirect('/auth')

  return (
    <TrainLoraClient
      standId={stand.id}
      standName={stand.name}
      initialPrimaryColor={stand.primary_color ?? '#1a3c6e'}
      initialTrainingStatus={stand.lora_training_status ?? 'none'}
      initialTrainingId={stand.lora_training_id ?? null}
      initialModelVersion={stand.lora_model_version ?? null}
    />
  )
}
