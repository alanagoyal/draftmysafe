import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

import AccountForm from "@/components/account-form"

export default async function Account() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("user", user)

  if (!user) {
    redirect("/login")
  }

  const { data: userData, error } = await supabase
    .from("users")
    .select()
    .eq("auth_id", user?.id)
    .single()

  console.log("userData", userData)

  return (
    <div className="flex w-full justify-center min-h-screen">
      <AccountForm user={user} userData={userData} />
    </div>
  )
}
