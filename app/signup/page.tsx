import Link from "next/link"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MagicLink from "@/components/magic-link"
import { SignupForm } from "@/components/signup-form"

import { signup } from "./actions"

export default async function Signup() {
  return (
    <>
      <div className="container mx-auto flex flex-col items-center justify-center p-4">
        <div className="w-full min-h-screen max-w-md flex flex-col space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <Tabs defaultValue="email" className="w-[400px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
              </TabsList>
              <TabsContent value="email">
                <SignupForm signup={signup} />
              </TabsContent>
              <TabsContent value="magic-link">
                <MagicLink redirect="account" />
              </TabsContent>
            </Tabs>
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
