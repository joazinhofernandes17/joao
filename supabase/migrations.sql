-- AutoShowroom Platform Schema
-- Execute no SQL Editor do Supabase

-- Stands (concessionários/stands de automóveis)
create table if not exists stands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text not null,
  logo_url text,
  phone text,
  email text,
  address text,
  website text,
  subscription_tier text not null default 'free',
  subscription_status text not null default 'active',
  images_used_this_month int not null default 0,
  images_limit int not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Showroom templates (ambientes virtuais disponíveis)
create table if not exists showroom_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  background_url text not null,
  thumbnail_url text not null,
  is_active boolean not null default true,
  tier_required text not null default 'free',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Viaturas
create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  stand_id uuid references stands(id) on delete cascade not null,
  make text not null,
  model text not null,
  year int,
  price numeric(12,2),
  mileage int,
  fuel_type text,
  transmission text,
  color text,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Imagens de viaturas
create table if not exists vehicle_images (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade not null,
  stand_id uuid references stands(id) on delete cascade not null,
  original_url text not null,
  enhanced_url text,
  nobg_url text,
  showroom_url text,
  showroom_template_id uuid references showroom_templates(id),
  view_angle text,
  processing_status text not null default 'pending',
  processing_error text,
  is_primary boolean not null default false,
  sort_order int not null default 0,
  original_width int,
  original_height int,
  final_width int,
  final_height int,
  file_size_kb int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table stands enable row level security;
alter table vehicles enable row level security;
alter table vehicle_images enable row level security;
alter table showroom_templates enable row level security;

create policy "stands_own" on stands for all using (auth.uid() = user_id);
create policy "vehicles_own" on vehicles for all using (
  stand_id in (select id from stands where user_id = auth.uid())
);
create policy "vehicle_images_own" on vehicle_images for all using (
  stand_id in (select id from stands where user_id = auth.uid())
);
create policy "showroom_templates_read" on showroom_templates for select using (is_active = true);

-- Templates iniciais
insert into showroom_templates (name, slug, description, background_url, thumbnail_url, tier_required, sort_order) values
  ('Nova', 'nova', 'Showroom minimalista em branco com plataforma circular', '/showrooms/nova-bg.png', '/showrooms/nova-thumb.png', 'free', 1),
  ('Elise', 'elise', 'Ambiente premium com tonalidades cinzas suaves', '/showrooms/elise-bg.png', '/showrooms/elise-thumb.png', 'free', 2),
  ('Origin', 'origin', 'Showroom clássico com pavimento de mármore', '/showrooms/origin-bg.png', '/showrooms/origin-thumb.png', 'starter', 3),
  ('Eclipse', 'eclipse', 'Fundo escuro dramático para máximo impacto', '/showrooms/eclipse-bg.png', '/showrooms/eclipse-thumb.png', 'pro', 4),
  ('Horizon', 'horizon', 'Exterior ao pôr do sol com estrada panorâmica', '/showrooms/horizon-bg.png', '/showrooms/horizon-thumb.png', 'pro', 5)
on conflict (slug) do nothing;

-- updated_at automático
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger stands_updated_at before update on stands for each row execute function update_updated_at();
create trigger vehicles_updated_at before update on vehicles for each row execute function update_updated_at();
create trigger vehicle_images_updated_at before update on vehicle_images for each row execute function update_updated_at();
