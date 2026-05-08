'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Car } from 'lucide-react'
import Link from 'next/link'

type Mode = 'login' | 'register'

function AuthForm() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [standName, setStandName] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'register') {
        if (!standName.trim() || standName.length < 2) {
          toast.error('Nome do stand deve ter pelo menos 2 caracteres')
          return
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { stand_name: standName.trim() } },
        })

        if (error) throw error

        if (data.user) {
          await supabase.from('stands').insert({
            user_id: data.user.id,
            name: standName.trim(),
            email,
          })
        }

        toast.success('Conta criada! Verifique o seu email para confirmar o registo.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Bem-vindo de volta!')
        router.push(redirect)
        router.refresh()
      }
    } catch (err: any) {
      const msg = err?.message || 'Ocorreu um erro'
      if (msg.includes('Invalid login credentials')) {
        toast.error('Email ou password incorretos')
      } else if (msg.includes('User already registered')) {
        toast.error('Este email já está registado')
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>{mode === 'login' ? 'Entrar na conta' : 'Criar conta do stand'}</CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Aceda ao painel do seu stand'
            : 'Registe o seu stand e comece a usar IA nas suas fotos'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="standName">Nome do Stand</Label>
              <Input
                id="standName"
                type="text"
                placeholder="Auto Stand Lisboa"
                value={standName}
                onChange={e => setStandName(e.target.value)}
                required
                minLength={2}
                maxLength={60}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="stand@exemplo.pt"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'A processar...' : mode === 'login' ? 'Entrar' : 'Criar conta gratuita'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              Ainda não tem conta?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-primary hover:underline font-medium"
              >
                Registar stand
              </button>
            </>
          ) : (
            <>
              Já tem conta?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-primary hover:underline font-medium"
              >
                Entrar
              </button>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  )
}

function AuthFormSkeleton() {
  return (
    <Card>
      <CardHeader className="text-center space-y-2">
        <Skeleton className="h-6 w-40 mx-auto" />
        <Skeleton className="h-4 w-56 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
      </CardContent>
    </Card>
  )
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl">
              Auto<span className="text-primary">Showroom</span>
            </span>
          </Link>
        </div>

        <Suspense fallback={<AuthFormSkeleton />}>
          <AuthForm />
        </Suspense>

        <p className="text-center text-xs text-muted-foreground">
          Plano gratuito inclui 10 fotos/mês. Sem cartão de crédito.
        </p>
      </div>
    </div>
  )
}
