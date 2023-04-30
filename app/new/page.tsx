"use client"

import { useState } from "react"
import { Document, Packer, Paragraph } from "docx"
import Docxtemplater from "docxtemplater"
import PizZip from "pizzip"
import PizZipUtils from "pizzip/utils/index.js"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Safe() {
  const [name, setName] = useState("")
  const [title, setTitle] = useState("")
  const [dateOfIncorporation, setDate] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [investorName, setInvestorName] = useState("")
  const [purchaseAmount, setPurchaseAmount] = useState("")
  const [stateOfIncorporation, setStateOfIncorporation] = useState("")
  const [valuationCap, setValuationCap] = useState("")

  async function createWordDocument(content) {
    // Split the content by line breaks and add each line as a paragraph
    const paragraphs = content.split("\n").map((line) => new Paragraph(line))

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    })

    // Convert the document to a binary buffer
    const buffer = await Packer.toBuffer(doc)
    return buffer
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Format date
    const date = new Date(dateOfIncorporation)
    const monthName = new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(date)
    const day = date.getDate()
    const year = date.getFullYear()
    const suffix = getNumberSuffix(day)
    const formattedDate = `${monthName} ${day}${suffix}, ${year}`

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

    // Load the docx template
    const response = await fetch("/SAFE-Template.docx")
    const arrayBuffer = await response.arrayBuffer()
    const zip = new PizZip(arrayBuffer)

    // Create a docxtemplater instance and load the zip
    const doc = new Docxtemplater().loadZip(zip)

    // Set the template variables
    doc.setData({
      company_name: companyName,
      investor_name: investorName,
      purchase_amount: Number(purchaseAmount).toLocaleString(),
      state_of_incorporation: stateOfIncorporation,
      valuation_cap: Number(valuationCap).toLocaleString(),
      date: date,
    })

    // Render the document
    doc.render()

    // Get the updated Word file content
    const updatedContent = doc.getZip().generate({ type: "blob" })

    // Create a download link and click it to start the download
    const link = document.createElement("a")
    link.href = URL.createObjectURL(updatedContent)
    link.download = "YC-Postmoney-SAFE-Modified.docx"
    link.click()

    // Clean up the download URL
    setTimeout(() => {
      URL.revokeObjectURL(link.href)
    }, 100)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">YC SAFE Generator</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center space-y-4"
      >
        <Label htmlFor="name" className="font-bold">
          Name
        </Label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="border border-gray-400 rounded px-4 py-2 w-full"
        />
        <Label htmlFor="title" className="font-bold">
          Title
        </Label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className="border border-gray-400 rounded px-4 py-2 w-full"
        />
        <Label htmlFor="company-name" className="font-bold">
          Company Name
        </Label>
        <Input
          type="text"
          id="company-name"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          required
          className="border border-gray-400 rounded px-4 py-2 w-full"
        />
        <Label htmlFor="investor-name" className="font-bold">
          Investor Name
        </Label>
        <Input
          type="text"
          id="investor-name"
          value={investorName}
          onChange={(event) => setInvestorName(event.target.value)}
          required
          className="border border-gray-400 rounded px-4 py-2 w-full"
        />
        <Label htmlFor="purchase-amount" className="font-bold">
          Purchase Amount
        </Label>
        <Input
          type="currency"
          id="purchase-amount"
          value={purchaseAmount}
          onChange={(event) => setPurchaseAmount(event.target.value)}
          required
          className="border border-gray-400 rounded px-4 py-2 w-full"
        />
        <Label htmlFor="valuation-cap" className="font-bold">
          Valuation Cap
        </Label>
        <Input
          type="currency"
          id="valuation-cap"
          value={valuationCap}
          onChange={(event) => setValuationCap(event.target.value)}
          required
          className="border border-gray-400 rounded px-4 py-2 w-full"
        />
        <Label htmlFor="state-of-incorporation" className="font-bold">
          State of Incorporation
        </Label>
        <Input
          type="text"
          id="state-of-incorporation"
          value={stateOfIncorporation}
          onChange={(event) => setStateOfIncorporation(event.target.value)}
          required
          className="border border-gray-400 rounded px-4 py-2 w-full"
        />
        <Label htmlFor="date" className="font-bold">
          Date
        </Label>
        <Input
          type="date"
          id="date"
          value={dateOfIncorporation}
          onChange={(event) => setDate(event.target.value)}
          required
          className="border border-gray-400 rounded px-4 py-2 w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
        >
          Generate SAFE
        </button>
      </form>
    </div>
  )
}
