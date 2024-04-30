"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ToastAction } from "./ui/toast"
import { toast } from "./ui/use-toast"

export interface SignupFormData {
  email: string
  password: string
}

interface SignupResponse {
  success: boolean
  errorMessage?: string
}

interface SignupFormProps {
  signup: (formData: SignupFormData) => Promise<SignupResponse>
}

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, {
    message: "Username must be at least 6 characters.",
  }),
})

export function SignupForm({ signup }: SignupFormProps) {
  const supabase = createClient()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function signInWithEmail(data: SignupFormData) {
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          // set this to false if you do not want the user to be automatically signed up
          shouldCreateUser: false,
          emailRedirectTo: "http://127.0.0.1:3000",
        },
      })
  }

  const onSubmit = async (data: SignupFormData) => {
    try {
      const response = await signup(data)
      if (response && !response.success) {
        if (response.errorMessage === "User already registered") {
          console.error(response.errorMessage)
          toast({
            title: "Account already exists",
            description: "Please sign in or sign up with another email",
            action: (
              <ToastAction
                onClick={() => router.push("/login")}
                altText="Sign in"
              >
                Sign in
              </ToastAction>
            ),
          })
        } else {
          toast({
            title: "Sign up failed",
            description: response.errorMessage,
          })
        }
      } else {
        toast({
          title: "Confirm your account",
          description: `An email has been sent to ${data.email}`,
        })
      }
    } catch (error) {
      console.error("Sign up failed:", error)
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again later.",
      })
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@email.com"
                        autoComplete="off"
                        {...field}
                      ></Input>
                    </FormControl>{" "}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="off"
                        placeholder="••••••••"
                        {...field}
                      ></Input>
                    </FormControl>{" "}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit">Sign Up</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
