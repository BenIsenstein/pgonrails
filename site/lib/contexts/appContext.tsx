"use client"

import { PropsWithChildren, createContext, useContext, useEffect } from "react"
import { AuthError, SupabaseClient, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import { MergeStateFunction, useMergeState } from "../hooks/useMergeState";
import { toast } from "sonner";

type SupabaseAuthResponseLike = { error: AuthError | null, [key: string]: unknown }

type WithCaptureAuthError = <T extends SupabaseAuthResponseLike>(fn: () => Promise<T>) => Promise<T>

type AppContextState = {
  user: User | null
  error: AuthError | null
}

type TAppContext = {
  supabase: SupabaseClient
  user: User | null
  error: AuthError | null
  clearError: () => void
  withCaptureAuthError: WithCaptureAuthError
  mergeState: MergeStateFunction<AppContextState>
}

const AppContext = createContext<TAppContext>({
  supabase,
  user: null,
  error: null,
  clearError: () => {},
  withCaptureAuthError: (async () => ({ error: null })) as WithCaptureAuthError,
  mergeState: () => {},
})

export const AppContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [state, mergeState] = useMergeState({
    user: null as User | null,
    error: null as AuthError | null,
  })

  const clearError = () => mergeState({ error: null })

  const withCaptureAuthError: WithCaptureAuthError = async (fn) => {
    clearError()
    const result = await fn()

    if (result.error) {
      mergeState({ error: result.error })
    }

    return result
  }

  useEffect(() => {
    supabase.auth.getUser().then(response => {
      mergeState({ user: response.data.user })
    })
    
    const listener = supabase.auth.onAuthStateChange(async (event, session) => {
      // If user updated their email successfully, show a toast
      if (event === "SIGNED_IN") {
        if (localStorage.getItem("email_change") && !session?.user.new_email) {
          localStorage.removeItem("email_change")
          mergeState({ user: session?.user || null })
          toast("Success!", {
            description: "Your email has successfully been updated."
          })
        }
      } else if (event !== "INITIAL_SESSION") {
        mergeState({ user: session?.user || null })
      }
    })

    return () => listener.data.subscription.unsubscribe()
  }, [mergeState])

  const value = {
    ...state,
    supabase,
    clearError,
    withCaptureAuthError,
    mergeState
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
    const context = useContext(AppContext)

    if (context === undefined) {
        throw new Error("useAppContext needs to be inside the AppContextProvider")
    }

    return context
}