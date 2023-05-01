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
          Y Combinator introduced the safe (simple agreement for future equity)
          in late 2013, and since then, it has been used by almost all YC
          startups and countless non-YC startups as the main instrument for
          early-stage fundraising.
        </p>
        <p>There are two types of YC SAFE notes: Discount and Valuation Cap.</p>
        <p className="mt-4">
          A Discount SAFE gives investors the right to purchase equity at a
          discount to the valuation of the next round of funding. This means
          that the investor will receive more shares for the same amount of
          money invested.
        </p>
        <p className="mt-4">
          A Valuation Cap SAFE sets a maximum valuation at which the investor
          can convert their investment into equity. If the company&apos;s
          valuation at the next round of funding is higher than the cap, the
          investor&apos;s investment will be converted into equity at the lower
          cap valuation, giving them a larger share of the company.
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
