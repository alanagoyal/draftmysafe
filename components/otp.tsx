"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"

import AuthRefresh from "./auth-refresh"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { toast } from "./ui/use-toast"

export default function Otp() {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function signInWithEmail(email: string) {
    setIsSubmitting(true)
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.href,
      },
    })
    setIsSubmitting(false)
    setEmail("") 
    if (error) {
      toast({
        title: "Failed to send magic link",
        description: error.message,
      })
    } else {
      toast({
        title: "Magic link sent to " + email,
        description: "Please click the link in your email to continue",
      })
    }
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center p-4">
      <AuthRefresh />
      <div className="w-full min-h-screen max-w-md flex flex-col space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Authentication Required
          </h1>
          <p className="text-sm text-muted-foreground">
            Please enter your email to authenticate with a magic link
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@email.com"
            autoComplete="off"
          />
          <Button
            className="w-full"
            onClick={() => signInWithEmail(email)}
            disabled={isSubmitting}
          >
            Send Magic Link
          </Button>
        </div>
      </div>
    </div>
  )
}
