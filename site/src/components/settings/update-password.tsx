// AI: Update password component. Two modes:
// - Simple: just new password + confirm
// - OTP: requires reauthentication via email code (controlled by VITE_UPDATE_PASSWORD_REQUIRE_REAUTHENTICATION env)
// Uses client-side Supabase.
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Loader2 } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/utils/supabase-browser'
import { toast } from 'sonner'

const REQUIRE_REAUTHENTICATION =
  import.meta.env.VITE_UPDATE_PASSWORD_REQUIRE_REAUTHENTICATION === 'true'

export function UpdatePassword() {
  return REQUIRE_REAUTHENTICATION ? <WithOtp /> : <Simple />
}

function Simple() {
  const supabase = getSupabaseBrowserClient()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const canSubmit = newPassword.length >= 8 && newPassword === confirmPassword

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>New password</Label>
        <Input
          type="password"
          placeholder="Enter new password..."
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Confirm new password</Label>
        <Input
          type="password"
          placeholder="Confirm new password..."
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <Button
        variant={canSubmit ? 'default' : 'outline'}
        disabled={!canSubmit || loading}
        onClick={handleSubmit}
      >
        {loading ? <Loader2 className="animate-spin" /> : 'Change password'}
      </Button>
    </div>
  )
}

function WithOtp() {
  const supabase = getSupabaseBrowserClient()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nonce, setNonce] = useState('')
  const [nonceLoading, setNonceLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  async function getNonce() {
    setNonceLoading(true)
    const { error } = await supabase.auth.reauthenticate()
    setNonceLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.info('Check your email for your one-time passcode.')
    }
  }

  async function handleSubmit() {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      nonce,
    })
    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
      setNonce('')
    }
  }

  const canGetOtp = newPassword.length >= 8 && newPassword === confirmPassword
  const canSubmit = canGetOtp && nonce.length === 6

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>New password</Label>
        <Input
          type="password"
          placeholder="Enter new password..."
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Confirm new password</Label>
        <Input
          type="password"
          placeholder="Confirm new password..."
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>One-time passcode</Label>
        <InputOTP maxLength={6} value={nonce} onChange={setNonce}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <p className="text-sm text-muted-foreground">
          To change your password, provide a one-time passcode sent to your email.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant={canGetOtp ? 'default' : 'outline'}
          disabled={!canGetOtp || nonceLoading}
          onClick={getNonce}
        >
          {nonceLoading ? <Loader2 className="animate-spin" /> : 'Get OTP'}
        </Button>
        <Button
          variant={canSubmit ? 'default' : 'outline'}
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Change password'}
        </Button>
      </div>
    </div>
  )
}
