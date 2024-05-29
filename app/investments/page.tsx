import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import Investments from "@/components/investments"

export default async function InvestmentsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select()
    .eq("auth_id", user?.id)
    .single()

  if (userError) {
    console.error(userError)
  }

  const { data: investmentData, error: investmentError } = await supabase
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
        fund:funds (name, byline, street, city_state_zip),
        url,
        summary
      `
    )
    .or(`investor_id.eq.${userData.id},founder_id.eq.${userData.id}`)

  if (investmentError) {
    console.error(investmentError)
  }

  return investmentData && investmentData.length > 0 ? (
    <div className="flex w-full justify-center min-h-screen">
      <Investments investments={investmentData} user={userData}/>
    </div>
  ) : (
    <div className="w-full px-4 flex justify-center items-center flex-col min-h-screen">
      <h1 className="text-2xl text-center font-bold mb-4">
        You haven&apos;t created <br /> any investments yet
      </h1>
      <Link className="flex justify-center pt-2" href="/new">
        <Button variant="outline">Get Started</Button>
      </Link>
    </div>
  )
}
