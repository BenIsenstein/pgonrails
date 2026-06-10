/// <reference types="vite/client" />
// AI: Root route. Fetches user on every navigation (beforeLoad), provides
// user data via route context to all child routes. Renders Navbar + Toaster.
// QueryClientProvider is here for React Query mutations used in auth forms.
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createServerFn } from '@tanstack/react-start'
import * as React from 'react'
import { DefaultCatchBoundary } from '../components/DefaultCatchBoundary'
import { NotFound } from '../components/NotFound'
import { Navbar } from '../components/navbar'
import { Toaster } from '../components/ui/sonner'
import appCss from '../styles/app.css?url'
import { seo } from '../utils/seo'
import { getSupabaseServerClient } from '../utils/supabase'
import { ThemeProvider } from '../components/theme-provider'
import type { AppUser } from '../utils/types'

// AI: fetchUser runs in beforeLoad on every navigation. Returns user metadata
// needed by navbar (avatar, name) and settings. Returns null if not authenticated.
const fetchUser = createServerFn({ method: 'GET' }).handler(async (): Promise<AppUser | null> => {
  const supabase = getSupabaseServerClient()
  const { data, error: _error } = await supabase.auth.getUser()

  if (!data.user?.email) {
    return null
  }

  const meta = data.user.user_metadata ?? {}

  return {
    id: data.user.id,
    email: data.user.email,
    fullName: (meta.full_name as string) || '',
    avatarImgName: (meta.avatar_img_name as string) || '',
    avatarImgCb: (meta.avatar_img_cb as string) || '',
  }
})

export const Route = createRootRoute({
  beforeLoad: async () => {
    const user = await fetchUser()
    return { user }
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...seo({
        title: 'PgOnRails — SaaS Template',
        description: 'A production-ready SaaS template with TanStack Start, Supabase, and shadcn/ui.',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: (props) => (
    <RootDocument>
      <DefaultCatchBoundary {...props} />
    </RootDocument>
  ),
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { user } = Route.useRouteContext()
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="system" storageKey="pgonrails-theme">
            <Navbar user={user} />
            {children}
            <Toaster />
          </ThemeProvider>
          <ReactQueryDevtools buttonPosition="bottom-left" />
        </QueryClientProvider>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
