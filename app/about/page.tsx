import React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AboutPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const aboutText = [
    "Y Combinator introduced the safe (simple agreement for future equity) in late 2013, and since then, it has been used by almost all YC startups and countless non-YC startups as the main instrument for early-stage fundraising.",
    "There are two types of YC SAFE notes: Discount and Valuation Cap.",
    "A Discount SAFE gives investors the right to purchase equity at a discount to the valuation of the next round of funding. This means that the investor will receive more shares for the same amount of money invested.",
    "A Valuation Cap SAFE sets a maximum valuation at which the investor can convert their investment into equity. If the company's valuation at the next round of funding is higher than the cap, the investor's investment will be converted into equity at the lower cap valuation, giving them a larger share of the company."
  ];

  return (
    <div className="flex flex-col items-center min-h-screen py-2 w-2/3 mx-auto">
      <h1 className="text-4xl font-bold mb-4">About</h1>
      <div className="text-base mb-6 max-w-lg text-center space-y-4">
        {aboutText.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <Link href="https://www.ycombinator.com/documents">
        <Button variant="ghost">Learn More</Button>
      </Link>
    </div>
  )
}

