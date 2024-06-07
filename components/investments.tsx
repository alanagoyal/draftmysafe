"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Plus } from "lucide-react"

import { Icons } from "./icons"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card"
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

// Dynamically import ReactQuill for client-side rendering
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

const downloadInvestmentFile = (url: string) => {
  window.open(url, "_blank")
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

  const canSendEmail = (investment: any) => {
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
      investment.url &&
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
          Summary: ${investment.fund.name} has shared a SAFE agreement with you.
          Please find the document attached to this email and find a brief
          summary of the document and its terms below.
        </p><br>
        <p>${investment.summary}</p><br>
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

      // Remove <br> tags from the email content before sending
      const emailContentToSend = editableEmailContent.replace(/<br\s*\/?>/gi, '');

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
      setDialogOpen(false)
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
                  ` ($${investment.valuation_cap})`}
                {investment.investment_type === "discount" &&
                  ` (${investment.discount}%)`}
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
                      {isOwner(investment) && investment.url && (
                        <DropdownMenuItem
                          onClick={() => downloadInvestmentFile(investment.url)}
                        >
                          Download
                        </DropdownMenuItem>
                      )}
                      {canSendEmail(investment) && (
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
                  Send
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
