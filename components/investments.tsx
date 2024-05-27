"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import Docxtemplater from "docxtemplater"
import { Plus } from "lucide-react"
import PizZip from "pizzip"
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

export default function Investments({
  investments,
  user,
}: {
  investments: any
  user: any
}) {
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

  async function downloadInvestment(id: string) {
    const filepath = `${id}.docx`
    try {
      const { error } =
        await supabase.storage.from("documents").download(filepath)

      // If file doesn't exist, generate and upload
      if (error) {
        const doc = await generateDocument(id)
        const file = doc.getZip().generate({ type: "nodebuffer" })
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filepath, file, {
            upsert: true,
            contentType:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            cacheControl: "3600",
          })
        if (uploadError) throw uploadError
      }
    } catch (downloadError) {
      console.error(downloadError)
    }

    // Generate a url
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(filepath, 3600)
    if (error) throw error
    
    if (data) {
      window.open(data.signedUrl, "_blank")
    }
  }

  async function generateDocument(id: string) {
    // Find the specific investment data from the investments array using the provided id
    const investmentData = investments.find(
      (investment: any) => investment.id === id
    )

    if (!investmentData) {
      toast({
        title: "Error",
        description: "Investment not found",
      })
      throw new Error("Investment data not found")
    }

    // Extract values from the investment data
    const values = {
      date: new Date(investmentData.date),
      type: investmentData.investment_type,
      companyName: investmentData.company.name,
      fundName: investmentData.fund.name,
      fundByline: investmentData.fund.byline,
      purchaseAmount: investmentData.purchase_amount,
      valuationCap: investmentData.valuation_cap,
      discount: investmentData.discount,
      stateOfIncorporation: investmentData.company.state_of_incorporation,
      investorName: investmentData.investor.name,
      investorTitle: investmentData.investor.title,
      investorEmail: investmentData.investor.email,
      fundStreet: investmentData.fund.street,
      fundCityStateZip: investmentData.fund.city_state_zip,
      founderName: investmentData.founder.name,
      founderTitle: investmentData.founder.title,
      founderEmail: investmentData.founder.email,
      companyStreet: investmentData.company.street,
      companyCityStateZip: investmentData.company.city_state_zip,
    }

    const formattedDate = formatSubmissionDate(values.date)
    const templateFileName = selectTemplate(values.type)
    const doc = await loadAndPrepareTemplate(
      templateFileName,
      values,
      formattedDate
    )
    return doc
  }

  function formatSubmissionDate(date: Date): string {
    const monthName = new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(date)
    const day = date.getDate()
    const year = date.getFullYear()
    const suffix = getNumberSuffix(day)
    return `${monthName} ${day}${suffix}, ${year}`
  }

  function getNumberSuffix(day: number): string {
    if (day >= 11 && day <= 13) {
      return "th"
    }
    switch (day % 10) {
      case 1:
        return "st"
      case 2:
        return "nd"
      case 3:
        return "rd"
      default:
        return "th"
    }
  }

  function selectTemplate(type: string): string {
    switch (type) {
      case "valuation-cap":
        return "SAFE-Valuation-Cap.docx"
      case "discount":
        return "SAFE-Discount.docx"
      case "mfn":
        return "SAFE-MFN.docx"
      default:
        return ""
    }
  }

  async function loadAndPrepareTemplate(
    templateFileName: string,
    values: any,
    formattedDate: string
  ): Promise<Docxtemplater> {
    const response = await fetch(`/${templateFileName}`)
    const arrayBuffer = await response.arrayBuffer()
    const zip = new PizZip(arrayBuffer)
    const doc = new Docxtemplater().loadZip(zip)
    doc.setData({
      company_name: values.companyName,
      investing_entity_name: values.fundName,
      byline: values.fundByline || "",
      purchase_amount: values.purchaseAmount,
      valuation_cap: values.valuationCap || "",
      discount: values.discount
        ? (100 - Number(values.discount)).toString()
        : "",
      state_of_incorporation: values.stateOfIncorporation,
      date: formattedDate,
      investor_name: values.investorName,
      investor_title: values.investorTitle,
      investor_email: values.investorEmail,
      investor_address_1: values.fundStreet,
      investor_address_2: values.fundCityStateZip,
      founder_name: values.founderName,
      founder_title: values.founderTitle,
      founder_email: values.founderEmail || "",
      company_address_1: values.companyStreet || "",
      company_address_2: values.companyCityStateZip || "",
    })
    doc.render()
    return doc
  }

  function downloadDocument(doc: Docxtemplater, type: string) {
    const updatedContent = doc.getZip().generate({ type: "blob" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(updatedContent)
    link.download =
      type === "valuation-cap"
        ? "YC-SAFE-Valuation-Cap.docx"
        : type === "discount"
        ? "YC-SAFE-Discount.docx"
        : "YC-SAFE-MFN.docx"
    link.click()
    setTimeout(() => {
      URL.revokeObjectURL(link.href)
    }, 100)
  }

  async function sendEmail(id: string) {
    try {
      const response = await fetch("/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })
      const data = await response.json()
      console.log(data)
    } catch (error) {
      console.error(error)
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
                      <DropdownMenuItem
                        onClick={() => downloadInvestment(investment.id)}
                      >
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => sendEmail(investment.id)}
                      >
                        Send
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
