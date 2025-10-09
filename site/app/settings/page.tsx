import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import UploadAvatar from "@/components/settings/UploadAvatar";
import UpdateDisplayName from "@/components/settings/UpdateDisplayName";
import UpdateEmail from "@/components/settings/UpdateEmail";
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
} from "@/components/ui/alert-dialog"
import { deleteAccount } from "../auth/actions";
import UpdatePassword from "@/components/settings/UpdatePassword";
import LiveDisplayName from "./LiveDisplayName";

export default async function Settings() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-8 sm:mb-10 md:mb-20">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                <LiveDisplayName initialValue={data?.user?.user_metadata?.full_name || ""} />
                <span className="text-gray-500"> ({data?.user?.email})</span>
            </h1>
            <p className="text-gray-500">
                Your personal account
            </p>
        </div>

        <section className="container space-y-6 mb-8 sm:mb-10 md:flex md:flex-row-reverse md:justify-end md:gap-40">
            <div className="space-y-2 relative">
                <Label>Profile picture</Label>
                <UploadAvatar />
            </div>
            <div className="w-full max-w-100 space-y-6">
                <div className="space-y-2">
                    <Label>Name</Label>
                    <UpdateDisplayName initialValue={data?.user?.user_metadata?.full_name} />
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <UpdateEmail initialValue={data?.user?.email} />
                </div>
            </div>
        </section>

        <section className="mb-8 sm:mb-10 md:mb-20 w-full max-w-100">
            <h2 className="text-xl sm:text-2xl font-bold mb-3">
                Change password
            </h2>
            <hr className="mb-4" />
            <UpdatePassword />
        </section>

        <section className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-red-500 mb-3">
                Delete account
            </h2>
            <hr className="mb-3" />
            <p className="mb-3">
                Once you delete your account, there is no going back. Please be certain.
            </p>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-500 hover:text-white hover:bg-red-500">
                        Delete your account
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and remove your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction className="bg-red-500 text-white hover:bg-red-400" onClick={deleteAccount}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
      </main>
    </div>
  )
}
