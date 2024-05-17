import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

import { DocusignAuthProvider } from "@/components/docusign-auth"

export default async function DocusignPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData, error } = await supabase
    .from("users")
    .select()
    .eq("auth_id", user?.id)
    .single()
  return (
    <div>
      <DocusignAuthProvider user={userData} />
    </div>
  )
}
