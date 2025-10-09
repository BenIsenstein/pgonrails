"use client"

import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

export default function SubmitButton({ children }) {
    const { pending } = useFormStatus()

    return (
        <Button
            className="w-full mt-6"
            type="submit"
            aria-disabled={pending}
            disabled={pending}
        >
            {pending ? <Loader2 className="animate-spin" /> : children}
        </Button>
    )
}