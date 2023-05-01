"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

const About = () => {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center min-h-screen pt-20 py-2">
      <h1 className="text-4xl font-bold mb-4">About</h1>
      <div className="text-xl font-base mb-6 max-w-lg text-center">
        <p>
          The YC SAFE (Simple Agreement for Future Equity) is a widely used
          investment instrument created by Y Combinator, a startup accelerator
          and venture capital firm. It allows startups to raise funds from
          investors without setting a valuation for the company.
        </p>
        <p className="mt-4">
          Instead, the investor receives the right to receive equity in the
          company at a future date, usually at the next round of funding or an
          acquisition. This allows the company to raise funds without the need
          for a complex negotiation of the company's worth.
        </p>
      </div>
      <div className="text-xl font-base mb-6 max-w-lg text-center">
        <p>There are two types of YC SAFE notes: Discount and Valuation Cap.</p>
        <p className="mt-4">
          A Discount SAFE gives investors the right to purchase equity at a
          discount to the valuation of the next round of funding. This means
          that the investor will receive more shares for the same amount of
          money invested.
        </p>
        <p className="mt-4">
          A Valuation Cap SAFE sets a maximum valuation at which the investor
          can convert their investment into equity. If the company's valuation
          at the next round of funding is higher than the cap, the investor's
          investment will be converted into equity at the lower cap valuation,
          giving them a larger share of the company.
        </p>
      </div>
      <Link href="https://www.ycombinator.com/documents">
        <Button
          type="button"
          className="bg-[#21D4FD] text-white font-bold py-2 px-4 rounded"
        >
          Learn More
        </Button>
      </Link>
    </div>
  )
}

export default About
