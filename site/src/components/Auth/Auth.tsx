import React, { useEffect, useState, FC, useRef } from 'react'
import { I18nVariables, merge, VIEWS, en, template, ViewType, ProviderScopes, OtpType } from '@supabase/auth-ui-shared'
import { Provider } from '@supabase/supabase-js'
import { useAppContext } from 'contexts'

type AuthProps = {
  providers?: Provider[]
  providerScopes?: Partial<ProviderScopes>
  queryParams?: {
    [key: string]: string;
  }
  view: ViewType
  setView?: React.Dispatch<React.SetStateAction<ViewType>>
  redirectTo?: string | undefined
  onlyThirdPartyProviders?: boolean
  magicLink?: boolean
  showLinks?: boolean
  otpType?: OtpType
  additionalData?: {
    [key: string]: unknown
  }
  // Override the labels and button text
  localization?: {
    variables?: I18nVariables
  }
}

type InputProps = {
  id: string
  type: string
  autoFocus?: boolean
  label: string
  placeholder: string
  autoComplete?: string
  onChange: (str: string) => void
}

export const Auth: FC<AuthProps> = ({
  providers,
  providerScopes,
  queryParams,
  view = 'sign_in',
  setView = () => {},
  redirectTo,
  onlyThirdPartyProviders = false,
  magicLink = false,
  showLinks = true,
  localization = { variables: {} },
  otpType = 'email',
  additionalData
}) => {
  const isMounted = useRef<boolean>(true)
  const { supabase, error, withCaptureAuthError } = useAppContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const i18n: I18nVariables = merge(en, localization.variables ?? {})
  const isSignView = view === 'sign_in' || view === 'sign_up' || view === 'magic_link'
  const isPhone = otpType === 'sms' || otpType === 'phone_change'
  const labels = i18n?.[view]
  const inputs: InputProps[] = []
  const links: ViewType[] = []

  const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.toLowerCase().slice(1)

  const handleProviderSignIn = async (provider: Provider) => {
    setLoading(true)

    await withCaptureAuthError(() => supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        scopes: providerScopes?.[provider],
        queryParams
      }
    }))

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (view === VIEWS.SIGN_IN) {
      await withCaptureAuthError(() => supabase.auth.signInWithPassword({
        email,
        password
      }))
    }

    if (view === VIEWS.SIGN_UP) {
      const { data: { user, session }} = await withCaptureAuthError(() => supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: additionalData
        }
      }))

      // Check if session is null -> email confirmation setting is turned on
      if (user && !session) {
        setMessage(i18n?.sign_up?.confirmation_text as string)
      }
    }

    if (view === VIEWS.FORGOTTEN_PASSWORD) {
      const { error } = await withCaptureAuthError(() => supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo
        }
      ))

      if (!error) {
        setMessage(i18n?.forgotten_password?.confirmation_text as string)
      }
    }

    if (view === VIEWS.MAGIC_LINK) {
      const { error } = await withCaptureAuthError(() => supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo
        }
      }))

      if (!error) {
        setMessage(i18n?.magic_link?.confirmation_text as string)
      }
    }

    if (view === VIEWS.UPDATE_PASSWORD) {
      const { error } = await withCaptureAuthError(() => supabase.auth.updateUser({ password }))

      if (!error) {
        setMessage(i18n?.update_password?.confirmation_text as string)
      }
    }

    if (view === VIEWS.VERIFY_OTP) {
      await withCaptureAuthError(() => supabase.auth.verifyOtp(
        isPhone
          ? { phone, token, type: otpType }
          : { email, token, type: otpType }
      ))
    }

    if (isMounted.current) setLoading(false)
  }

  if (isSignView || view === VIEWS.FORGOTTEN_PASSWORD || (view === VIEWS.VERIFY_OTP && !isPhone)) {
    inputs.push({
      id: "email",
      type: "email",
      autoFocus: true,
      placeholder: labels?.email_input_placeholder,
      label: (view === VIEWS.MAGIC_LINK  || view === VIEWS.VERIFY_OTP) ? labels?.email_input_label : labels?.email_label,
      onChange: setEmail
    })
  }

  if (view === VIEWS.SIGN_IN || view === VIEWS.SIGN_UP || view === VIEWS.UPDATE_PASSWORD) {
    inputs.push({
      id: "password",
      type: "password",
      label: labels?.password_label,
      placeholder: view === VIEWS.UPDATE_PASSWORD ? labels?.password_label : labels?.password_input_placeholder,
      autoFocus: view === VIEWS.UPDATE_PASSWORD || undefined,
      onChange: setPassword,
      autoComplete: view === 'sign_in' ? 'current-password' : 'new-password'
    })
  }

  if (view === VIEWS.VERIFY_OTP && isPhone) {
    inputs.push({
      id: "phone",
      type: "text",
      label: labels?.phone_input_label,
      autoFocus: true,
      placeholder: labels?.phone_input_placeholder,
      onChange: setPhone
    })
  }

  if (view === VIEWS.VERIFY_OTP) {
    inputs.push({
      id: "token",
      type: "text",
      label: labels?.token_input_label,
      placeholder: labels?.token_input_placeholder,
      onChange: setToken
    })
  }

  if (isSignView) {
    links.push(view !== VIEWS.SIGN_IN ? VIEWS.SIGN_IN : VIEWS.SIGN_UP)
  }

  if (view === VIEWS.SIGN_IN) {
    links.push(VIEWS.FORGOTTEN_PASSWORD)
  }

  if (view === VIEWS.SIGN_IN && magicLink) {
    links.push(VIEWS.MAGIC_LINK)
  }

  if (view === VIEWS.FORGOTTEN_PASSWORD || view === VIEWS.VERIFY_OTP) {
    links.push(VIEWS.SIGN_IN)
  }

  if (view === VIEWS.UPDATE_PASSWORD) {
    links.push(VIEWS.SIGN_UP)
  }

  useEffect(() => {
    // Overrides the authview if it is changed externally
    const listener = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('update_password')
      } else if (event === 'USER_UPDATED' || event === 'SIGNED_OUT') {
        setView('sign_in')
      }
    })
    
    return () => listener.data.subscription.unsubscribe()
  }, [supabase.auth, setView])

  useEffect(() => () => {isMounted.current = false}, [])
  
  if (!view) return null

  return (
    <>
      {isSignView && providers && providers.length > 0 && (
        <>
          <div className="flex flex-col gap-2 my-2">
            {providers.map((provider: Provider) => (
              <button
                key={provider}
                className="flex justify-center items-center gap-2 rounded-md text-sm p-1 cursor-pointer border-[1px] border-zinc-950 w-full disabled:opacity-70 disabled:cursor-[unset] bg-transparent text-black hover:bg-stone-100"
                disabled={loading}
                onClick={() => handleProviderSignIn(provider)}
              >
                <img src={`/${provider}.svg`} />
                {template(
                  i18n?.[view === 'magic_link' ? 'sign_in' : view]?.social_provider_text as string,
                  { provider: capitalize(provider) }
                )}
              </button>
            ))}
          </div>
          {!onlyThirdPartyProviders && <div className="block my-4 h-[1px] w-full" />}
        </>
      )}
      {!onlyThirdPartyProviders && (
        <>
          <form
            id={view}
            onSubmit={handleSubmit}
            autoComplete='on'
            className="flex flex-col gap-2 my-2"
          >
            {inputs.map(({ id, type, label, placeholder, autoFocus, autoComplete, onChange }) => (
              <div key={id}>
                <label htmlFor={id} className="text-sm mb-1 text-black block">
                  {label}
                </label>
                <input
                  className="py-1 px-2 cursor-text border-[1px] border-solid border-black text-s w-full text-black box-border hover:[outline:none] focus:[outline:none]"
                  id={id}
                  name={id}
                  type={type}
                  autoFocus={autoFocus}
                  autoComplete={autoComplete}
                  placeholder={placeholder}
                  onChange={(e) => onChange(e.target.value)}
                />
              </div>
            ))}

            <button
              className="flex justify-center items-center rounded-md text-sm p-1 cursor-pointer border-[1px] border-zinc-950 w-full mt-2 disabled:opacity-70 disabled:cursor-[unset] bg-amber-200 text-amber-950 hover:bg-amber-300"
              type="submit"
              disabled={loading}
            >
              {loading ? labels?.loading_button_label : labels?.button_label}
            </button>

            {showLinks && (
              <div className="flex flex-col gap-3 my-2">
                {links.map(v => (
                  <a
                    key={v}
                    className="block text-xs text-center underline hover:text-blue-700"
                    href={`#${v}`}
                    onClick={(e) => {
                      e.preventDefault()
                      setView(v)
                    }}
                  >
                    {i18n?.[v]?.link_text}
                  </a>
                ))}
              </div>
            )}
          </form>
          {message && (
            <span className="block text-center text-xs mb-1 rounded-md py-6 px-4 border-[1px] border-black">
              {message}
            </span>
          )}
          {error && (
            <span className="block text-center text-xs mb-1 rounded-md py-6 px-4 border-[1px] text-red-900 bg-red-100 border-red-950">
              {error.message}
            </span>
          )}
        </>
      )}
    </>
  )
}
