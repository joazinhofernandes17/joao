export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import {
  startLoraTraining,
  getLoraTrainingStatus,
  fetchUnsplashTrainingImages,
} from '@/lib/image-processing/lora-trainer'

// POST /api/train-lora
// Body: { standId, standName, primaryColor?, imageUrls? }
// Triggers ostris/flux-dev-lora-trainer on Replicate
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { standId, standName, primaryColor, imageUrls } = body

    if (!standId || !standName) {
      return NextResponse.json({ error: 'standId e standName são obrigatórios' }, { status: 400 })
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: 'REPLICATE_API_TOKEN não configurado' }, { status: 500 })
    }
    if (!process.env.REPLICATE_USERNAME) {
      return NextResponse.json({ error: 'REPLICATE_USERNAME não configurado' }, { status: 500 })
    }

    const job = await startLoraTraining({ standId, standName, primaryColor, imageUrls })

    return NextResponse.json({
      success: true,
      trainingId: job.trainingId,
      status: job.status,
      message: 'Treino LoRA iniciado. Demora ~15-20 minutos e custa ~$2.',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Erro desconhecido' }, { status: 500 })
  }
}

// GET /api/train-lora?trainingId=xxx
// Polls Replicate for training status and updates DB when done
export async function GET(req: NextRequest) {
  const trainingId = req.nextUrl.searchParams.get('trainingId')

  if (!trainingId) {
    return NextResponse.json({ error: 'trainingId é obrigatório' }, { status: 400 })
  }

  try {
    const job = await getLoraTrainingStatus(trainingId)
    return NextResponse.json(job)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Erro desconhecido' }, { status: 500 })
  }
}
