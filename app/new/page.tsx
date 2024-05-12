import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import FormComponent from "@/components/form-component"
import Otp from "@/components/otp"

export default async function Safe({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()
  const sharing = searchParams.sharing === "true"
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    if (sharing) {
      return <Otp />
    } else {
      redirect("/login")
    }
  }

  const { data: userData, error } = await supabase
    .from("users")
    .select()
    .eq("auth_id", user?.id)
    .single()
  return (
    <div className="flex w-full justify-center min-h-screen">
      <FormComponent userData={userData} />
    </div>
  )
}
