import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm'

export default function ForgotPassword() {
    return (
        <div className="flex items-center justify-center bg-muted min-h-screen" >
            <Card className="w-[350px] mx-auto">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center py-4">
                        <Image src="/logo.png" alt="logo" width={50} height={50} />
                    </div>

                    <CardTitle className="text-2xl font-bold">Forgot Your Password?</CardTitle>
                    <CardDescription>Enter your email address</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <ForgotPasswordForm />
                </CardContent>
                <CardFooter className="flex-col text-center">
                    <Link prefetch={false} className="w-full text-sm text-muted-foreground " href="/signin">
                        Remember your password? Sign in
                    </Link>
                    <Link prefetch={false} className="w-full text-sm text-muted-foreground" href="/signup">
                        Don't have an account? Sign up
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}