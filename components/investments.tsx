"use client"

import { useRouter } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Icons } from "./icons"
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
import { createClient } from "@/utils/supabase/client"
import { toast } from "./ui/use-toast"

export default function Investments({ investments }: { investments: any }) {
  const router = useRouter()
  const supabase = createClient()

  // Mapping investment types to user-friendly strings
  type InvestmentTypeKey = "valuation-cap" | "discount" | "mfn"
  const formatInvestmentType = (type: InvestmentTypeKey | string): string => {
    const investmentTypes: Record<InvestmentTypeKey, string> = {
      "valuation-cap": "Valuation Cap",
      discount: "Discount",
      mfn: "MFN",
    }
    return investmentTypes[type as InvestmentTypeKey] || type
  }

  // Tooltip for missing company information
  const MissingCompanyTooltip = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className="text-red-500">
            <Icons.info className="inline-block mr-2" />
            Company Name Missing
          </span>
        </TooltipTrigger>
        <TooltipContent>
          Fill in company information or share the link with the founder
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  const editInvestment = (id: string) => {
    router.push(`/new?id=${id}`)
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

  return (
    <div className="flex flex-col items-center min-h-screen py-2 w-4/5">
      <h1 className="text-2xl font-bold mb-8">Investments</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Founder</TableHead>
            <TableHead>Fund</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((investment: any) => (
            <TableRow
              key={investment.id}
            >
              <TableCell>
                {investment.company ? (
                  investment.company.name
                ) : (
                  <MissingCompanyTooltip />
                )}
              </TableCell>
              <TableCell>
                {investment.founder
                  ? `${investment.founder.name} (${investment.founder.email})`
                  : "N/A"}
              </TableCell>
              <TableCell>
                {investment.fund ? `${investment.fund.name}` : "N/A"}
              </TableCell>
              <TableCell>
                {formatInvestmentType(investment.investment_type)}
              </TableCell>
              <TableCell>
                {investment.purchase_amount
                  ? `$${investment.purchase_amount}`
                  : "N/A"}
              </TableCell>
              <TableCell>
                <div className="flex justify-between items-center">
                  {new Date(investment.date).toLocaleDateString()}{" "}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center">
                      <Icons.menu className="h-4 w-4 ml-2" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => editInvestment(investment.id)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteInvestment(investment.id)}>Delete</DropdownMenuItem>
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
