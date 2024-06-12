"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

import { Icons } from "./icons"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
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
import "react-quill/dist/quill.snow.css"
import Docxtemplater from "docxtemplater"
import PizZip from "pizzip"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

const downloadDocument = (url: string) => {
  window.open(url, "_blank")
  toast({
    title: "Downloaded",
    description: "The file has been downloaded",
  })
}

export default function Investments({
  investments,
  userData,
}: {
  investments: any
  userData: any
}) {
  const router = useRouter()
  const supabase = createClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState(null)
  const [editableEmailContent, setEditableEmailContent] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const formatCurrency = (amountStr: string): string => {
    const amount = parseFloat(amountStr.replace(/,/g, ""))
    if (amount >= 1_000_000) {
      const millions = amount / 1_000_000
      return `$${
        millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)
      }M`
    } else if (amount >= 1000) {
      const thousands = amount / 1000
      return `$${
        thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)
      }k`
    } else {
      return `$${amount}`
    }
  }

  const formatInvestmentType = (
    type: "valuation-cap" | "discount" | "mfn" | string
  ): JSX.Element | string => {
    if (!type) {
      return <MissingInfoTooltip message="Investment type not set" />
    }
    const investmentTypes: Record<
      "valuation-cap" | "discount" | "mfn",
      string
    > = {
      "valuation-cap": "Valuation Cap",
      discount: "Discount",
      mfn: "MFN",
    }
    return investmentTypes[type as "valuation-cap" | "discount" | "mfn"] || type
  }

  const isOwner = (investment: any) => {
    return investment.created_by === userData.auth_id
  }

  const isFounder = (investment: any) => {
    return investment.founder.id === userData.id
  }

  const investmentIsComplete = (investment: any) => {
    return (
      isOwner(investment) &&
      investment.founder &&
      investment.founder.email &&
      investment.company &&
      investment.company.name &&
      investment.fund &&
      investment.fund.name &&
      investment.investment_type &&
      investment.purchase_amount &&
      investment.date &&
      investment.safe_url &&
      investment.summary
    )
  }

  const MissingInfoTooltip = ({ message }: { message: string }) => (
    <span className="text-red-500">
      <Icons.info className="inline-block mr-2" />
      {message}
    </span>
  )

  const editInvestment = (investment: any) => {
    if (isOwner(investment)) {
      router.push(`/new?id=${investment.id}&edit=true`)
    } else if (isFounder(investment)) {
      router.push(`/new?id=${investment.id}&edit=true&step=2`)
    }
  }

  async function deleteInvestment(investment: any) {
    const { error } = await supabase
      .from("investments")
      .delete()
      .eq("id", investment.id)
    if (error) throw error
    toast({
      title: "Investment deleted",
      description: "This investment has been deleted",
    })
    router.refresh()
  }

  const emailContent = (investment: any) => {
    return `
      <div>
        <p>Hi ${investment.founder.name.split(" ")[0]},</p><br>
        <p>
          ${investment.fund.name} has shared a SAFE agreement with you.
          Please find the document attached to this email and find a brief
          summary of the document and its terms below.
        </p><br>
        <p>Summary: ${investment.summary}</p><br>
        <p>
          Disclaimer: This summary is for informational purposes only and does
          not constitute legal advice. For any legal matters or specific
          questions, you should consult with a qualified attorney.
        </p>
      </div>
    `
  }

  const setSelectedInvestmentAndEmailContent = (investment: any) => {
    setSelectedInvestment(investment)
    setEditableEmailContent(emailContent(investment))
  }

  async function sendEmail(investment: any) {
    setIsSendingEmail(true)
    const filepath = `${investment.id}.docx`

    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .download(filepath)

      if (error) {
        throw error
      }

      const buffer = await data.arrayBuffer()
      const nodeBuffer = Buffer.from(buffer)

      const emailContentToSend = editableEmailContent.replace(
        /<br\s*\/?>/gi,
        ""
      )

      const body = {
        investmentData: investment,
        attachment: nodeBuffer,
        emailContent: emailContentToSend,
      }

      const response = await fetch("/send-investment-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      toast({
        title: "Email sent",
        description: `The email has been sent to ${investment.founder.email}`,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
      setDialogOpen(false)
    }
  }

  async function generateSideLetter(investment: any) {
    const formattedDate = formatSubmissionDate(new Date(investment.date))
    const doc = await loadAndPrepareSideLetterTemplate(investment, formattedDate)
    const buffer = doc.getZip().generate({ type: "nodebuffer" })
    const filepath = `${investment.id}-side-letter.docx`

    try {
      // only upload if the side_letter doesnt appear in supabase yet
      if (investment.side_letter_url) {
        window.open(investment.side_letter_url, "_blank")
        return
      }

      const { error } = await supabase.storage
        .from("documents")
        .upload(filepath, buffer, {
          upsert: true,
          contentType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        })

      if (error) {
        console.error("Upload error:", error)
        throw error
      }

      const { data: newSignedUrlData, error: newSignedUrlError } =
        await supabase.storage.from("documents").createSignedUrl(filepath, 3600)
      if (newSignedUrlError) {
        console.error("Error creating signed URL:", newSignedUrlError)
        throw newSignedUrlError
      }

      const { data: uploadData, error: uploadError } = await supabase
        .from("investments")
        .update({
          side_letter_url: newSignedUrlData.signedUrl,
        })
        .eq("id", investment.id)

      if (uploadError) {
        console.error("Error uploading side letter:", uploadError)
        throw uploadError
      }

      window.open(newSignedUrlData.signedUrl, "_blank")

      toast({
        title: "Downloaded",
        description: "The side letter has been downloaded",
      })
    } catch (error) {
      console.error("Error uploading side letter:", error)
      toast({
        title: "Error",
        description: "Failed to upload side letter. Please try again.",
        variant: "destructive",
      })
    }
  }

  async function loadAndPrepareSideLetterTemplate(
    investment: any,
    formattedDate: string
  ): Promise<Docxtemplater> {
    const response = await fetch(`/Side-Letter.docx`)
    const arrayBuffer = await response.arrayBuffer()
    const zip = new PizZip(arrayBuffer)
    const doc = new Docxtemplater().loadZip(zip)
    doc.setData({
      company_name: investment.company.name || "{company_name}",
      investing_entity_name: investment.fund.name || "{investing_entity_name}",
      byline: investment.fund.byline || "{byline}",
      state_of_incorporation:
        investment.company.state_of_incorporation || "{state_of_incorporation}",
      date: formattedDate || "{date}",
      investor_name: investment.investor.name || "{investor_name}",
      investor_title: investment.investor.title || "{investor_title}",
      investor_email: investment.investor.email || "{investor_email}",
      investor_address_1: investment.fund.street || "{investor_address_1}",
      investor_address_2:
        investment.fund.city_state_zip || "{investor_address_2}",
      founder_name: investment.founder.name || "{founder_name}",
      founder_title: investment.founder.title || "{founder_title}",
      founder_email: investment.founder.email || "{founder_email}",
      company_address_1: investment.company.street || "{company_address_1}",
      company_address_2:
        investment.company.city_state_zip || "{company_address_2}",
    })
    doc.render()
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

  return (
    <div className="flex flex-col items-center min-h-screen py-2 w-4/5">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-2xl font-bold">Investments</h1>
        <Button onClick={() => router.push("/new")}>
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
                {investment.investment_type === "valuation-cap" &&
                  ` (${formatCurrency(investment.valuation_cap)})`}
                {investment.investment_type === "discount" &&
                  ` (${investment.discount}%)`}
              </TableCell>
              <TableCell>
                {investment.purchase_amount ? (
                  `${formatCurrency(investment.purchase_amount)}`
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
                      {investment.side_letter && investment.side_letter.side_letter_url && (
                        <DropdownMenuItem
                          onClick={() => downloadDocument(investment.side_letter.side_letter_url)}
                        >
                          Download Side Letter
                        </DropdownMenuItem>
                      )}
                      {investment.safe_url && (
                        <DropdownMenuItem
                            onClick={() =>
                              downloadDocument(investment.safe_url)
                            }
                          >
                            Download SAFE Agreement
                          </DropdownMenuItem>
                        )}
                      {investmentIsComplete(investment) && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedInvestmentAndEmailContent(investment)
                            setDialogOpen(true)
                          }}
                        >
                          Send
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => editInvestment(investment)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteInvestment(investment)}
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger className="hidden" />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>
              Send an email to your founder with the investment details
            </DialogDescription>
          </DialogHeader>
          {selectedInvestment && (
            <div className="flex flex-col items-center space-y-2">
              <div>
                <ReactQuill
                  theme="snow"
                  value={editableEmailContent}
                  onChange={setEditableEmailContent}
                  placeholder={emailContent(selectedInvestment)}
                />
              </div>
              <div className="w-full">
                <Button
                  className="w-full"
                  onClick={() => sendEmail(selectedInvestment)}
                >
                  {isSendingEmail ? <Icons.spinner /> : "Send"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
