import AuthRefresh from "@/components/auth-refresh"
import FormComponent from "@/components/form-component"
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Safe() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userData, error } = await supabase
    .from("users")
    .select()
    .eq("auth_id", user?.id)
    .single();
  return (
    <div className="flex w-full justify-center min-h-screen">
      <AuthRefresh/>
      <FormComponent userData={userData}/>
    </div>
  )
}
