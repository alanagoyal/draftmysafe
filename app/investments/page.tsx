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
        founder:users!founder_id (id, name, title, email),
        company:companies (id, name, street, city_state_zip, state_of_incorporation),
        investor:users!investor_id (id, name, title, email),
        fund:funds (id, name, byline, street, city_state_zip),
        side_letter:side_letters (id, side_letter_url, info_rights, pro_rata_rights, major_investor_rights, termination, miscellaneous),
        side_letter_id,
        safe_url,
        summary,
        created_by
      `
    )
    .or(
      `investor_id.eq.${userData.id},founder_id.eq.${userData.id},created_by.eq.${userData.auth_id}`
    )

  if (investmentError) {
    console.error(investmentError)
  }

  return investmentData && investmentData.length > 0 ? (
    <div className="flex w-full justify-center min-h-screen">
      <Investments investments={investmentData} userData={userData} />
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
