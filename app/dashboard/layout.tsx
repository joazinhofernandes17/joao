export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Car, LayoutDashboard, Settings, LogOut, Plus } from 'lucide-react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: stand } = await supabase
    .from('stands')
    .select('name, subscription_tier, images_used_this_month, images_limit')
    .eq('user_id', user.id)
    .single()

  const usagePercent = stand && stand.images_limit > 0
    ? Math.round((stand.images_used_this_month / stand.images_limit) * 100)
    : 0

  const signOut = async () => {
    'use server'
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-sm">
              Auto<span className="text-primary">Showroom</span>
            </span>
          </Link>
        </div>

        {stand && (
          <div className="p-4 border-b border-border">
            <p className="text-xs text-muted-foreground mb-1">Stand</p>
            <p className="font-semibold text-sm truncate">{stand.name}</p>
            <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
              {stand.subscription_tier}
            </span>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <LayoutDashboard className="h-4 w-4" />
            Painel
          </Link>
          <Link href="/dashboard/upload" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Plus className="h-4 w-4" />
            Nova Viatura
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Settings className="h-4 w-4" />
            Definições
          </Link>
        </nav>

        {stand && stand.images_limit > 0 && (
          <div className="p-4 border-t border-border">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Imagens este mês</span>
              <span>{stand.images_used_this_month}/{stand.images_limit}</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usagePercent > 80 ? 'bg-destructive' : 'bg-primary'}`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="p-3 border-t border-border">
          <form action={signOut}>
            <button type="submit" className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
