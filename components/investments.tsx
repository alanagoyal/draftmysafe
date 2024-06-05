"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Plus } from "lucide-react"
import { Icons } from "./icons"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { toast } from "./ui/use-toast"

const downloadInvestmentFile = (url: string) => {
  window.open(url, "_blank")
}

export default function Investments({ investments }: { investments: any }) {
  const router = useRouter()
  const supabase = createClient()

  // Mapping investment types to user-friendly strings
  type InvestmentTypeKey = "valuation-cap" | "discount" | "mfn"
  const formatInvestmentType = (
    type: InvestmentTypeKey | string
  ): JSX.Element | string => {
    if (!type) {
      return <MissingInfoTooltip message="Investment type not set" />
    }
    const investmentTypes: Record<InvestmentTypeKey, string> = {
      "valuation-cap": "Valuation Cap",
      discount: "Discount",
      mfn: "MFN",
    }
    return investmentTypes[type as InvestmentTypeKey] || type
  }

  // Reusable Tooltip for missing information
  const MissingInfoTooltip = ({ message }: { message: string }) => (
    <span className="text-red-500">
      <Icons.info className="inline-block mr-2" />
      {message}
    </span>
  )

  const editInvestment = (id: string) => {
    router.push(`/new?id=${id}&edit=true`)
  }

  async function deleteInvestment(id: string) {
    const { error } = await supabase.from("investments").delete().eq("id", id)
    if (error) throw error
    toast({
      title: "Investment deleted",
      description: "This investment has been deleted",
    })
    router.refresh()
  }

  async function sendEmail(id: string) {
    const investmentData = investments.find(
      (investment: any) => investment.id === id
    )
    const filepath = `${investmentData.id}.docx`

    try {
      // Download the document from Supabase storage
      const { data, error } = await supabase.storage
        .from("documents")
        .download(filepath)

      if (error) {
        throw error
      }

      // Convert Blob to Node buffer
      const buffer = await data.arrayBuffer()
      const nodeBuffer = Buffer.from(buffer)

      // Prepare the email body
      const body = {
        investmentData: investmentData,
        content: nodeBuffer,
      }

      const response = await fetch("/send-investment-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
    } catch (error) {
      console.error(error)
    } finally {
      toast({
        title: "Email sent",
        description: `The email has been sent to ${investmentData.founder.email}`,
      })
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-2 w-4/5">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-2xl ml-28 font-bold text-center flex-grow">
          Investments
        </h1>
        <Button
          variant="ghost"
          onClick={() => router.push("/new")}
          className="w-28"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Generate</span>
        </Button>
      </div>
      <Table className="w-full mt-10">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/6">Company</TableHead>
            <TableHead className="w-1/6">Founder</TableHead>
            <TableHead className="w-1/6">Fund</TableHead>
            <TableHead className="w-1/6">Type</TableHead>
            <TableHead className="w-1/6">Amount</TableHead>
            <TableHead className="w-1/6">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((investment: any) => (
            <TableRow key={investment.id}>
              <TableCell>
                {investment.company ? (
                  investment.company.name
                ) : (
                  <MissingInfoTooltip message="Company name missing" />
                )}
              </TableCell>
              <TableCell>
                {investment.founder ? (
                  `${investment.founder.name} (${investment.founder.email})`
                ) : (
                  <MissingInfoTooltip message="Founder information missing" />
                )}
              </TableCell>
              <TableCell>
                {investment.fund ? (
                  `${investment.fund.name}`
                ) : (
                  <MissingInfoTooltip message="Fund name missing" />
                )}
              </TableCell>
              <TableCell>
                {formatInvestmentType(investment.investment_type)}
                {investment.investment_type === "valuation-cap" && ` ($${investment.valuation_cap})`}
                {investment.investment_type === "discount" && ` (${investment.discount}%)`}
              </TableCell>
              <TableCell>
                {investment.purchase_amount ? (
                  `$${investment.purchase_amount}`
                ) : (
                  <MissingInfoTooltip message="Purchase amount not set" />
                )}
              </TableCell>
              <TableCell>
                <div className="flex justify-between items-center">
                  {new Date(investment.date).toLocaleDateString()}{" "}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center">
                      <Icons.menu className="h-4 w-4 ml-2" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {investment.url && (
                        <DropdownMenuItem
                          onClick={() => downloadInvestmentFile(investment.url)}
                        >
                          Download
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => sendEmail(investment.id)}
                      >
                        Send
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => editInvestment(investment.id)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteInvestment(investment.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
