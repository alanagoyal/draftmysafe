import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import Investments from "@/components/investments"

export default async function InvestmentsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData, error: userError} = await supabase
    .from("users")
    .select()
    .eq("auth_id", user?.id)
    .single()

    if (userError) {
        console.error(userError)
    }

    const {data: investmentData, error: investmentError} = await supabase
    .from("investments")
    .select(
        `
        id,
        purchase_amount,
        investment_type,
        valuation_cap,
        discount,
        date,
        founder:users!founder_id (name, title, email),
        company:companies (name, street, city_state_zip, state_of_incorporation),
        investor:users!investor_id (name, title, email),
        fund:funds (name, byline, street, city_state_zip)
      `
      )
    .eq("created_by", userData.auth_id)

    if (investmentError) {
        console.error(investmentError)
    }

  return (
    <div className="flex w-full justify-center min-h-screen">
        <Investments investments={investmentData} />
    </div>
  )
}
