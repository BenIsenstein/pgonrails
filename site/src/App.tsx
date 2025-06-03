import { useState } from 'react'
import { ViewType } from '@supabase/auth-ui-shared'
import { Auth } from 'components'
import { useAppContext } from 'contexts'

const OAUTH_PROVIDERS = import.meta.env.VITE_OAUTH_PROVIDERS || ''
const providers = OAUTH_PROVIDERS?.split(',')?.filter((str: string) => !!str)

const views: { id: ViewType; title: string }[] = [
  { id: 'sign_in', title: 'Sign In' },
  { id: 'sign_up', title: 'Sign Up' },
  { id: 'magic_link', title: 'Magic Link' },
  { id: 'forgotten_password', title: 'Forgotten Password' },
  { id: 'update_password', title: 'Update Password' },
  { id: 'verify_otp', title: 'Verify Otp' },
]

export const App = () => {
  const [view, setView] = useState<ViewType>('sign_in')
  const { user, supabase, withCaptureAuthError, clearError } = useAppContext()

  return (
    <div className="box-border p-5 relative">
      {user && (
        <button
          className="absolute top-5 right-5 font-semibold hover:underline active:text-zinc-500 z-50"
          onClick={() => withCaptureAuthError(() => supabase.auth.signOut())}
        >
          Logout
        </button>
      )}
      <div className="relative flex flex-col items-center gap-6 pt-10 md:pt-6 md:flex-row md:justify-center md:items-start">
        <div className="relative w-full max-w-sm border-[1px] border-slate-300 rounded-lg shadow-lg px-8 py-12">
          <div className="mb-6 flex flex-col gap-3">
            <h1 className="text-scale-1200 text-2xl">
              Acme Industries
            </h1>
            <p className="text-scale-1100 text-auth-widget-test">
              Sign in today for Supa stuff
            </p>
          </div>
          <Auth
            view={view}
            setView={setView}
            providers={providers}
          />
        </div>
        <div className="flex flex-col items-center gap-4 border-[1px] border-slate-300 rounded-lg shadow-sm p-8 mb-6 h-max">
          <div className="text-scale-1200 text-base font-semibold">Component View</div>
          <select
            value={view}
            onChange={(e) => {
              clearError()
              setView(e.target.value as ViewType)}
            }
            className="text-lg rounded border-[1px] border-slate-950 text-gray-600 pl-5 pr-10 h-12 bg-white hover:bg-slate-100 cursor-pointer appearance-none w-max text-center"
          >
            {views.map((v, i) => <option key={i} value={v.id}>{v.title}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}
