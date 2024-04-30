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
  return (
    <div className="w-full">
      <AuthRefresh/>
      <FormComponent />
    </div>
  )
}
