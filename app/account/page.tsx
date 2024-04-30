import AccountForm from "@/components/account-form";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Account() {
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
    <div className="w-full min-h-screen flex justify-center">
      <AccountForm user={user} userData={userData} />
    </div>
  );
}
