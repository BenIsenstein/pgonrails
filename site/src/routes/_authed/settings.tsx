// AI: Settings page. Protected under /_authed layout.
// Sections: avatar, display name, email, password, delete account.
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { UploadAvatar } from '@/components/settings/upload-avatar'
import { UpdateDisplayName } from '@/components/settings/update-display-name'
import { UpdateEmail } from '@/components/settings/update-email'
import { UpdatePassword } from '@/components/settings/update-password'
import { deleteAccountFn } from '@/server/auth'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authed/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const router = useRouter()
  const { user } = Route.useRouteContext()

  const deleteMutation = useMutation({
    mutationFn: () => deleteAccountFn(),
    onSuccess: async (data) => {
      if (data.success) {
        toast.success('Account deleted')
        await router.invalidate()
        router.navigate({ to: '/' })
      } else {
        toast.error(data.message)
      }
    },
  })

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold">
          {user.fullName || 'Your Account'}
          <span className="text-muted-foreground font-normal"> ({user.email})</span>
        </h1>
        <p className="text-muted-foreground">Your personal account</p>
      </div>

      {/* Profile section */}
      <section className="mb-10 md:flex md:flex-row-reverse md:justify-end md:gap-20">
        <div className="space-y-2 mb-6 md:mb-0">
          <Label>Profile picture</Label>
          <UploadAvatar user={user} />
        </div>
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <Label>Name</Label>
            <UpdateDisplayName initialValue={user.fullName} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <UpdateEmail initialValue={user.email} />
          </div>
        </div>
      </section>

      {/* Password section */}
      <section className="mb-10 max-w-sm">
        <h2 className="text-xl font-bold mb-3">Change password</h2>
        <hr className="mb-4" />
        <UpdatePassword />
      </section>

      {/* Danger zone */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-destructive mb-3">Delete account</h2>
        <hr className="mb-3" />
        <p className="mb-3 text-muted-foreground">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-destructive hover:bg-destructive hover:text-primary-foreground">
              Delete your account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteMutation.mutate()}
              >
                Delete account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </main>
  )
}
