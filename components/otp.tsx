"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"

import AuthRefresh from "./auth-refresh"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export default function Otp() {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function signInWithEmail(email: string) {
    setIsSubmitting(true)
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // set this to false if you do not want the user to be automatically signed up
        shouldCreateUser: true,
        emailRedirectTo: window.location.href,
      },
    })
    setIsSubmitting(false)
    if (error) {
      alert("Failed to send OTP: " + error.message)
    } else {
      alert("OTP sent to " + email)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <AuthRefresh />
      <p>Please enter your email to receive a one-time password:</p>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="mb-2 p-1"
      />
      <Button onClick={() => signInWithEmail(email)} disabled={isSubmitting}>
        Send OTP
      </Button>
    </div>
  )
}
