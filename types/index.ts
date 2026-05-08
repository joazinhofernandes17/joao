export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise'
export type ProcessingStatus = 'pending' | 'processing' | 'done' | 'error'
export type VehicleStatus = 'active' | 'sold' | 'hidden'
export type FuelType = 'gasolina' | 'gasóleo' | 'híbrido' | 'elétrico' | 'gpl'
export type TransmissionType = 'manual' | 'automático'

export interface Stand {
  id: string
  user_id: string
  name: string
  logo_url: string | null
  phone: string | null
  email: string | null
  address: string | null
  website: string | null
  subscription_tier: SubscriptionTier
  subscription_status: string
  images_used_this_month: number
  images_limit: number
  created_at: string
  updated_at: string
}

export interface ShowroomTemplate {
  id: string
  name: string
  slug: string
  description: string | null
  background_url: string
  thumbnail_url: string
  is_active: boolean
  tier_required: SubscriptionTier
  sort_order: number
}

export interface Vehicle {
  id: string
  stand_id: string
  make: string
  model: string
  year: number | null
  price: number | null
  mileage: number | null
  fuel_type: FuelType | null
  transmission: TransmissionType | null
  color: string | null
  description: string | null
  status: VehicleStatus
  created_at: string
  updated_at: string
  vehicle_images?: VehicleImage[]
}

export interface VehicleImage {
  id: string
  vehicle_id: string
  stand_id: string
  original_url: string
  enhanced_url: string | null
  nobg_url: string | null
  showroom_url: string | null
  showroom_template_id: string | null
  view_angle: string | null
  processing_status: ProcessingStatus
  processing_error: string | null
  is_primary: boolean
  sort_order: number
  original_width: number | null
  original_height: number | null
  final_width: number | null
  final_height: number | null
  file_size_kb: number | null
  created_at: string
  updated_at: string
  showroom_templates?: ShowroomTemplate
}

export const TIER_LIMITS: Record<SubscriptionTier, number> = {
  free: 10,
  starter: 100,
  pro: 500,
  enterprise: -1,
}

export const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Gratuito',
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
}
