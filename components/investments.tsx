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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

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

  const handleRightClick = (
    event: React.MouseEvent,
    investment: any,
    step: number
  ) => {
    event.preventDefault() // Prevent the default context menu
    router.push(`/new?id=${investment.id}&edit=true&step=${step}`)
  }

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
    const safeFilepath = `${investment.id}.docx`
    const sideLetterFilepath = `${investment.id}-side-letter.docx`

    let safeDocNodeBuffer = null
    let sideLetterDocNodeBuffer = null

    try {
      if (investment.safe_url) {
        const { data: safeDoc, error: safeDocError } = await supabase.storage
          .from("documents")
          .download(safeFilepath)

        if (!safeDocError && safeDoc) {
          const safeDocBuffer = await safeDoc.arrayBuffer()
          safeDocNodeBuffer = Buffer.from(safeDocBuffer)
        }
      }

      if (investment.side_letter && investment.side_letter.side_letter_url) {
        const { data: sideLetterDoc, error: sideLetterDocError } =
          await supabase.storage.from("documents").download(sideLetterFilepath)

        if (!sideLetterDocError && sideLetterDoc) {
          const sideLetterDocBuffer = await sideLetterDoc.arrayBuffer()
          sideLetterDocNodeBuffer = Buffer.from(sideLetterDocBuffer)
        }
      }

      const emailContentToSend = editableEmailContent.replace(
        /<br\s*\/?>/gi,
        ""
      )

      const body = {
        investmentData: investment,
        safeAttachment: safeDocNodeBuffer,
        sideLetterAttachment: sideLetterDocNodeBuffer,
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild className="cursor-pointer">
                      <div
                        onClick={() =>
                          router.push(
                            `/new?id=${investment.id}&edit=true&step=2`
                          )
                        }
                      >
                        {investment.company ? (
                          investment.company.name
                        ) : (
                          <MissingInfoTooltip message="Company name missing" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to edit company information</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild className="cursor-pointer">
                      <div
                        onClick={() =>
                          router.push(
                            `/new?id=${investment.id}&edit=true&step=2`
                          )
                        }
                      >
                        {investment.founder ? (
                          `${investment.founder.name} (${investment.founder.email})`
                        ) : (
                          <MissingInfoTooltip message="Founder information missing" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to edit founder information</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild className="cursor-pointer">
                      <div
                        onClick={() =>
                          router.push(
                            `/new?id=${investment.id}&edit=true&step=1`
                          )
                        }
                      >
                        {investment.fund ? (
                          investment.fund.name
                        ) : (
                          <MissingInfoTooltip message="Fund name missing" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to edit investor information</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild className="cursor-pointer">
                      <div
                        onClick={() =>
                          router.push(
                            `/new?id=${investment.id}&edit=true&step=3`
                          )
                        }
                      >
                        {formatInvestmentType(investment.investment_type)}
                        {investment.investment_type === "valuation-cap" &&
                          ` (${formatCurrency(investment.valuation_cap)})`}
                        {investment.investment_type === "discount" &&
                          ` (${investment.discount}%)`}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to edit investment type</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild className="cursor-pointer">
                      <div
                        onClick={() =>
                          router.push(
                            `/new?id=${investment.id}&edit=true&step=3`
                          )
                        }
                      >
                        {investment.purchase_amount ? (
                          `${formatCurrency(investment.purchase_amount)}`
                        ) : (
                          <MissingInfoTooltip message="Purchase amount not set" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to edit purchase amount</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild className="cursor-pointer">
                      <div
                        onClick={() =>
                          router.push(
                            `/new?id=${investment.id}&edit=true&step=3`
                          )
                        }
                      >
                        <div className="flex justify-between items-center">
                          {new Date(investment.date).toLocaleDateString()}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to edit date</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center">
                    <Icons.menu className="h-4 w-4 ml-2" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {investment.side_letter &&
                      investment.side_letter.side_letter_url && (
                        <DropdownMenuItem
                          onClick={() =>
                            downloadDocument(
                              investment.side_letter.side_letter_url
                            )
                          }
                        >
                          Download Side Letter
                        </DropdownMenuItem>
                      )}
                    {investment.safe_url && (
                      <DropdownMenuItem
                        onClick={() => downloadDocument(investment.safe_url)}
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
                      onClick={() => deleteInvestment(investment)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
