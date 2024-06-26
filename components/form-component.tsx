"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import Docxtemplater from "docxtemplater"
import mammoth from "mammoth"
import PizZip from "pizzip"
import Confetti from "react-confetti"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { cn, formDescriptions } from "@/lib/utils"

import AuthRefresh from "./auth-refresh"
import { EntitySelector } from "./entity-selector"
import { Icons } from "./icons"
import { Share } from "./share"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Switch } from "./ui/switch"
import { Textarea } from "./ui/textarea"
import { toast } from "./ui/use-toast"

const FormComponentSchema = z.object({
  companyName: z.string().optional(),
  fundName: z.string().optional(),
  fundByline: z.string().optional(),
  purchaseAmount: z.string().min(1, { message: "Purchase amount is required" }),
  type: z.enum(["valuation-cap", "discount", "mfn"]),
  valuationCap: z.string().optional(),
  discount: z.string().optional(),
  stateOfIncorporation: z.string({
    required_error: "State of incorporation is required",
  }),
  date: z.date({ required_error: "Date is required" }),
  investorName: z.string().optional(),
  investorTitle: z.string().optional(),
  investorEmail: z.string().optional(),
  fundStreet: z.string().optional(),
  fundCityStateZip: z.string().optional(),
  founderName: z.string().optional(),
  founderTitle: z.string().optional(),
  founderEmail: z.string().optional(),
  companyStreet: z.string().optional(),
  companyCityStateZip: z.string().optional(),
  infoRights: z.boolean().optional(),
  proRataRights: z.boolean().optional(),
  majorInvestorRights: z.boolean().optional(),
  termination: z.boolean().optional(),
  miscellaneous: z.boolean().optional(),
})

type FormComponentValues = z.infer<typeof FormComponentSchema>

type InvestmentData = {
  founder_id?: string
  company_id?: string
  investor_id?: string
  fund_id?: string
  purchase_amount: string
  investment_type: "valuation-cap" | "discount" | "mfn"
  valuation_cap?: string
  discount?: string
  date: Date
  created_by?: string
  safe_url?: string | null
  summary?: string | null
  info_rights?: boolean
  pro_rata_rights?: boolean
  major_investor_rights?: string
  termination?: string
  miscellaneous?: string
}

export default function FormComponent({ userData }: { userData: any }) {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(parseInt(searchParams.get("step") || "1"))
  const [investmentId, setInvestmentId] = useState<string | null>(
    searchParams.get("id") || null
  )
  const [sideLetterId, setSideLetterId] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [entities, setEntities] = useState<any[]>([])
  const [selectedEntity, setSelectedEntity] = useState<string | undefined>(
    undefined
  )
  const [showFundSelector, setShowFundSelector] = useState(true)
  const [showCompanySelector, setShowCompanySelector] = useState(true)
  const isFormLocked = searchParams.get("sharing") === "true"
  const isEditMode = searchParams.get("edit") === "true"
  const [isOwner, setIsOwner] = useState(true)
  const [isLoadingSave, setIsLoadingSave] = useState(false)

  const handleStepChange = (newStep: number) => {
    setStep(newStep)
  }

  const form = useForm<FormComponentValues>({
    resolver: zodResolver(FormComponentSchema),
    defaultValues: {
      companyName: "",
      fundName: "",
      fundByline: "",
      purchaseAmount: "",
      type: undefined,
      valuationCap: "",
      discount: "",
      stateOfIncorporation: "",
      date: new Date(),
      investorName: "",
      investorTitle: "",
      investorEmail: "",
      fundStreet: "",
      fundCityStateZip: "",
      founderName: "",
      founderTitle: "",
      founderEmail: "",
      companyStreet: "",
      companyCityStateZip: "",
      infoRights: false,
      proRataRights: false,
      majorInvestorRights: false,
      termination: false,
      miscellaneous: false,
    },
  })

  useEffect(() => {
    if (userData) {
      fetchEntities()
      if (isFormLocked) {
        form.reset({
          ...form.getValues(),
          founderEmail: userData.email,
        })
      }
    }
  }, [userData, isFormLocked])

  // Update the URL when the step changes, including sharing state if applicable
  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set("step", step.toString())
    if (investmentId) {
      newSearchParams.set("id", investmentId)
      fetchInvestmentDetails(investmentId)
    }
    if (isFormLocked) {
      newSearchParams.set("sharing", "true")
    }
    router.push(`?${newSearchParams.toString()}`)
  }, [step, router, investmentId, isFormLocked])

  async function fetchInvestmentDetails(investmentId: string) {
    const { data: dataIncorrectlyTyped, error } = await supabase
      .from("investments")
      .select(
        `
      purchase_amount,
      investment_type,
      valuation_cap,
      discount,
      date,
      created_by,
      founder:users!founder_id (name, title, email),
      company:companies (id, name, street, city_state_zip, state_of_incorporation, founder_id),
      investor:users!investor_id (name, title, email),
      fund:funds (id, name, byline, street, city_state_zip, investor_id),
      side_letter:side_letters (id, side_letter_url, info_rights, pro_rata_rights, major_investor_rights, termination, miscellaneous)
    `
      )
      .eq("id", investmentId)
      .single()

    if (error) {
      console.error("Error fetching investment details:", error)
      return
    }

    if (dataIncorrectlyTyped) {
      const data = dataIncorrectlyTyped as any

      form.reset({
        companyName: data.company?.name || "",
        fundName: data.fund?.name || "",
        fundByline: data.fund?.byline || "",
        purchaseAmount: data.purchase_amount || "",
        type: data.investment_type || undefined,
        valuationCap: data.valuation_cap || "",
        discount: data.discount || "",
        stateOfIncorporation: data.company?.state_of_incorporation || "",
        date: data.date ? new Date(data.date) : new Date(),
        investorName: data.investor?.name || "",
        investorTitle: data.investor?.title || "",
        investorEmail: data.investor?.email || "",
        fundStreet: data.fund?.street || "",
        fundCityStateZip: data.fund?.city_state_zip || "",
        founderName: data.founder?.name || "",
        founderTitle: data.founder?.title || "",
        founderEmail: data.founder?.email || "",
        companyStreet: data.company?.street || "",
        companyCityStateZip: data.company?.city_state_zip || "",
        infoRights: data.side_letter?.info_rights || false,
        proRataRights: data.side_letter?.pro_rata_rights || false,
        majorInvestorRights: data.side_letter?.major_investor_rights || false,
        termination: data.side_letter?.termination || false,
        miscellaneous: data.side_letter?.miscellaneous || false,
      })
      if (step === 1 && data.fund && data.fund.investor_id === userData.id) {
        setSelectedEntity(data.fund.id)
        setShowFundSelector(true)
      } else if (
        step === 2 &&
        data.company &&
        data.company.founder_id === userData.id
      ) {
        setSelectedEntity(data.company.id)
        setShowCompanySelector(true)
      } else {
        setSelectedEntity(undefined)
        if (step === 1) {
          setShowFundSelector(false)
        }
        if (step === 2) {
          setShowCompanySelector(false)
        }
      }
      // If the user is editing an investment that is not theirs, lock the form
      if (userData.auth_id !== data.created_by) {
        setIsOwner(false)
      }
    }
  }

  async function fetchEntities() {
    const { data: fundData, error: fundError } = await supabase
      .from("funds")
      .select()
      .eq("investor_id", userData.id)

    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .select()
      .eq("founder_id", userData.id)

    if (!fundError && !companyError) {
      const typedFundData = fundData.map((fund) => ({ ...fund, type: "fund" }))
      const typedCompanyData = companyData.map((company) => ({
        ...company,
        type: "company",
      }))
      setEntities([...typedFundData, ...typedCompanyData])
    }
  }

  async function onSubmit(values: FormComponentValues) {
    // Process the investment
    if (isEditMode) {
      toast({
        description: "Investment updated",
      })
      // router.push("/investments")
      await processInvestment(values)
      // router.refresh()
    } else {
      setShowConfetti(true)
      toast({
        title: "Your SAFE agreement has been created",
        description:
          "You can view, edit, or download it by visiting your Investments.",
      })
      try {
        await processInvestment(values)
      } finally {
        setShowConfetti(false)
      }
      // router.push("/investments")
      // router.refresh()
    }
  }

  async function processInvestorDetails(values: FormComponentValues) {
    if (
      values.investorName === "" &&
      values.investorTitle === "" &&
      values.investorEmail === ""
    )
      return null

    try {
      const investorData = {
        name: values.investorName,
        title: values.investorTitle,
        email: values.investorEmail,
        updated_at: new Date(),
      }

      // Check if user already exists and update
      const { data: existingInvestor, error: existingInvestorError } =
        await supabase
          .from("users")
          .select("id")
          .eq("email", values.investorEmail)

      if (existingInvestor && existingInvestor.length > 0) {
        const { error: updateError } = await supabase
          .from("users")
          .update(investorData)
          .eq("id", existingInvestor[0].id)
        if (updateError) throw updateError
        return existingInvestor[0].id

        // Insert new user
      } else {
        const { data, error } = await supabase
          .from("users")
          .insert(investorData)
          .select("id")
        if (error) throw error
        return data[0].id
      }
    } catch (error) {
      console.error("Error processing investor details:", error)
      return null
    }
  }

  async function processFundDetails(
    values: FormComponentValues,
    investorId: string
  ) {
    if (
      values.fundName === "" &&
      values.fundByline === "" &&
      values.fundStreet === "" &&
      values.fundCityStateZip === ""
    )
      return null
    try {
      const fundData = {
        name: values.fundName,
        byline: values.fundByline,
        street: values.fundStreet,
        city_state_zip: values.fundCityStateZip,
        investor_id: investorId,
      }

      // Check if fund already exists and update
      const { data: existingFund, error: existingFundError } = await supabase
        .from("funds")
        .select("id")
        .eq("name", values.fundName)
        .eq("investor_id", investorId)

      if (existingFund && existingFund.length > 0) {
        const { error: updateError } = await supabase
          .from("funds")
          .update(fundData)
          .eq("id", existingFund[0].id)
        if (updateError) throw updateError
        return existingFund[0].id

        // Insert new fund
      } else {
        const { data: newFund, error: newFundError } = await supabase
          .from("funds")
          .insert(fundData)
          .select()
        if (newFundError) throw newFundError
        return newFund[0].id
      }
    } catch (error) {
      console.error("Error processing fund details:", error)
    }
  }

  async function processFounderDetails(values: FormComponentValues) {
    if (
      values.founderName === "" &&
      values.founderTitle === "" &&
      values.founderEmail === ""
    )
      return null

    try {
      const founderData = {
        name: values.founderName,
        title: values.founderTitle,
        email: values.founderEmail,
        updated_at: new Date(),
      }

      // Check if the founder already exists and update
      const { data: existingFounder, error: existingFounderError } =
        await supabase
          .from("users")
          .select("id")
          .eq("email", values.founderEmail)

      if (existingFounder && existingFounder.length > 0) {
        const { error: updateError } = await supabase
          .from("users")
          .update(founderData)
          .eq("id", existingFounder[0].id)
        if (updateError) throw updateError
        return existingFounder[0].id

        // Insert new founder
      } else {
        const { data: newFounder, error: newFounderError } = await supabase
          .from("users")
          .insert(founderData)
          .select("id")
        if (newFounderError) throw newFounderError
        return newFounder[0].id
      }
    } catch (error) {
      console.error("Error processing founder details:", error)
    }
  }

  async function processCompanyDetails(
    values: FormComponentValues,
    founderId: string
  ) {
    if (
      values.companyName === "" &&
      values.companyStreet === "" &&
      values.companyCityStateZip === "" &&
      values.stateOfIncorporation === ""
    )
      return null

    try {
      const companyData = {
        name: values.companyName,
        street: values.companyStreet,
        city_state_zip: values.companyCityStateZip,
        state_of_incorporation: values.stateOfIncorporation,
        founder_id: founderId,
      }

      // Check if company already exists and update
      const { data: existingCompany, error: existingCompanyError } =
        await supabase
          .from("companies")
          .select("id")
          .eq("name", values.companyName)
          .eq("founder_id", founderId)

      if (existingCompany && existingCompany.length > 0) {
        const { error: updateError } = await supabase
          .from("companies")
          .update(companyData)
          .eq("id", existingCompany[0].id)
        if (updateError) throw updateError
        return existingCompany[0].id

        // Insert new company
      } else {
        const { data: newCompany, error: newCompanyError } = await supabase
          .from("companies")
          .insert(companyData)
          .select()
        if (newCompanyError) throw newCompanyError
        return newCompany[0].id
      }
    } catch (error) {
      console.error("Error processing company details:", error)
    }
  }

  async function processSideLetter(values: FormComponentValues) {
    // Only process if the side letter is not empty
    if (
      values.infoRights === false &&
      values.proRataRights === false &&
      values.majorInvestorRights === false &&
      values.termination === false &&
      values.miscellaneous === false
    )
      return null
    try {
      const sideLetterDoc = await generateSideLetter(values)
      const sideLetterUrl = await createSideLetterUrl(sideLetterDoc)
      const sideLetter = {
        ...(sideLetterId && { id: sideLetterId }), // Include the existing side letter ID if provided
        info_rights: values.infoRights,
        pro_rata_rights: values.proRataRights,
        major_investor_rights: values.majorInvestorRights,
        termination: values.termination,
        miscellaneous: values.miscellaneous,
        side_letter_url: sideLetterUrl,
      }
      // Upsert the side_letters table with this data using the id of the investment
      const { data: sideLetterData, error: sideLetterError } = await supabase
        .from("side_letters")
        .upsert({ ...sideLetter })
        .select("id")
      if (sideLetterError) throw sideLetterError
      setSideLetterId(sideLetterData[0].id)
      return sideLetterData[0].id
    } catch (error) {
      console.error("Error processing side letter:", error)
    }
  }

  async function processInvestment(
    values: FormComponentValues,
    investorId?: string | null,
    fundId?: string | null,
    founderId?: string | null,
    companyId?: string | null
  ): Promise<string | null> {
    try {
      const investmentData: InvestmentData = {
        ...(founderId && { founder_id: founderId }),
        ...(companyId && { company_id: companyId }),
        ...(investorId && { investor_id: investorId }),
        ...(fundId && { fund_id: fundId }),
        purchase_amount: values.purchaseAmount,
        investment_type: values.type,
        ...(values.valuationCap && { valuation_cap: values.valuationCap }),
        ...(values.discount && { discount: values.discount }),
        date: values.date,
      }

      let investmentIdResult: string | null = null

      if (!investmentId) {
        investmentData.created_by = userData.auth_id
        const { data: investmentInsertData, error: investmentInsertError } =
          await supabase.from("investments").insert(investmentData).select("id")
        if (investmentInsertError) throw investmentInsertError
        investmentIdResult = investmentInsertData[0].id
        setInvestmentId(investmentIdResult)
      } else {
        const safeDoc = await generateSafe(values)
        const safeUrl = await createSafeUrl(safeDoc)
        console.log("safeUrl", safeUrl)
        // const investmentSummary = await summarizeInvestment(safeDoc)
        const sideLetterId = await processSideLetter(values)
        const { data: investmentUpdateData, error: investmentUpdateError } =
          await supabase
            .from("investments")
            .upsert({
              ...investmentData,
              safe_url: safeUrl,
              side_letter_id: sideLetterId,
              // summary: investmentSummary,
              id: investmentId,
            })
            .select("id")
        if (investmentUpdateError) throw investmentUpdateError
        investmentIdResult = investmentUpdateData[0].id
        setInvestmentId(investmentIdResult)
      }

      return investmentIdResult
    } catch (error) {
      console.error("Error processing investment details:", error)
      return null
    }
  }

  async function createSafeUrl(doc: Docxtemplater): Promise<string | null> {
    const filepath = `${investmentId}.docx`
    try {
      // If the file does not exist, generate and upload it
      const file = doc.getZip().generate({ type: "nodebuffer" })
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filepath, file, {
          upsert: true,
          contentType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          cacheControl: "3600",
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        return null
      }

      // After uploading, attempt to create a signed URL again
      const { data: newSignedUrlData, error: newSignedUrlError } =
        await supabase.storage.from("documents").createSignedUrl(filepath, 3600)
      if (newSignedUrlError) {
        console.error(
          "Failed to create signed URL after upload:",
          newSignedUrlError
        )
        return null
      }

      return newSignedUrlData?.signedUrl || null
    } catch (error) {
      console.error("Error in createUrl function:", error)
      return null
    }
  }

  async function createSideLetterUrl(
    doc: Docxtemplater
  ): Promise<string | null> {
    const filepath = `${investmentId}-side-letter.docx`

    try {
      const file = doc.getZip().generate({ type: "nodebuffer" })
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filepath, file, {
          upsert: true,
          contentType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          cacheControl: "3600",
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        return null
      }

      const { data: newSignedUrlData, error: newSignedUrlError } =
        await supabase.storage.from("documents").createSignedUrl(filepath, 3600)
      if (newSignedUrlError) {
        console.error(
          "Failed to create signed URL after upload:",
          newSignedUrlError
        )
        return null
      }

      return newSignedUrlData?.signedUrl || null
    } catch (error) {
      console.error("Error in createSideLetterUrl function:", error)
      return null
    }
  }

  async function generateSafe(values: FormComponentValues) {
    const formattedDate = formatSubmissionDate(values.date)
    const templateFileName = selectTemplate(values.type || "mfn")
    const doc = await loadAndPrepareTemplate(
      templateFileName,
      values,
      formattedDate
    )
    return doc
  }

  async function generateSideLetter(values: FormComponentValues) {
    const formattedDate = formatSubmissionDate(values.date)
    const doc = await loadAndPrepareSideLetterTemplate(values, formattedDate)
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
        return "SAFE-MFN.docx"
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
      company_name: values.companyName || "{company_name}",
      investing_entity_name: values.fundName || "{investing_entity_name}",
      byline: values.fundByline || "",
      purchase_amount: values.purchaseAmount || "{purchase_amount}",
      valuation_cap: values.valuationCap || "{valuation_cap}",
      discount: values.discount
        ? (100 - Number(values.discount)).toString()
        : "{discount}",
      state_of_incorporation:
        values.stateOfIncorporation || "{state_of_incorporation}",
      date: formattedDate || "{date}",
      investor_name: values.investorName || "{investor_name}",
      investor_title: values.investorTitle || "{investor_title}",
      investor_email: values.investorEmail || "{investor_email}",
      investor_address_1: values.fundStreet || "{investor_address_1}",
      investor_address_2: values.fundCityStateZip || "{investor_address_2}",
      founder_name: values.founderName || "{founder_name}",
      founder_title: values.founderTitle || "{founder_title}",
      founder_email: values.founderEmail || "{founder_email}",
      company_address_1: values.companyStreet || "{company_address_1}",
      company_address_2: values.companyCityStateZip || "{company_address_2}",
    })
    doc.render()
    return doc
  }

  async function loadAndPrepareSideLetterTemplate(
    values: FormComponentValues,
    formattedDate: string
  ): Promise<Docxtemplater> {
    const response = await fetch(`/Side-Letter.docx`)
    const arrayBuffer = await response.arrayBuffer()
    const zip = new PizZip(arrayBuffer)
    const doc = new Docxtemplater(zip, { linebreaks: true })
    doc.setData({
      company_name: values.companyName || "{company_name}",
      investing_entity_name: values.fundName || "{investing_entity_name}",
      byline: values.fundByline || "",
      purchase_amount: values.purchaseAmount || "{purchase_amount}",
      valuation_cap: values.valuationCap || "{valuation_cap}",
      discount: values.discount
        ? (100 - Number(values.discount)).toString()
        : "{discount}",
      state_of_incorporation:
        values.stateOfIncorporation || "{state_of_incorporation}",
      date: formattedDate || "{date}",
      investor_name: values.investorName || "{investor_name}",
      investor_title: values.investorTitle || "{investor_title}",
      investor_email: values.investorEmail || "{investor_email}",
      investor_address_1: values.fundStreet || "{investor_address_1}",
      investor_address_2: values.fundCityStateZip || "{investor_address_2}",
      founder_name: values.founderName || "{founder_name}",
      founder_title: values.founderTitle || "{founder_title}",
      founder_email: values.founderEmail || "{founder_email}",
      company_address_1: values.companyStreet || "{company_address_1}",
      company_address_2: values.companyCityStateZip || "{company_address_2}",
      info_rights: values.infoRights || false,
      pro_rata_rights: values.proRataRights || false,
      major_investor_rights: values.majorInvestorRights || false,
      termination: values.termination || false,
      miscellaneous: values.miscellaneous || false,
    })
    doc.render()
    return doc
  }

  async function summarizeInvestment(
    doc: Docxtemplater
  ): Promise<string | null> {
    try {
      const blob = doc.getZip().generate({ type: "blob" })
      const arrayBuffer = await blob.arrayBuffer()
      const { value: htmlContent } = await mammoth.convertToHtml({
        arrayBuffer,
      })

      const response = await fetch("/generate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: htmlContent }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to summarize investment",
        })
        throw new Error("Failed to summarize investment")
      }

      if (data.summary.length === 0) {
        toast({
          title: "Error",
          description: "Failed to summarize investment",
        })
        throw new Error("Failed to summarize investment")
      }

      return data.summary
    } catch (error) {
      console.error("Error in summarizing investment:", error)
      return null
    }
  }

  async function handleSelectChange(value: string) {
    setSelectedEntity(value)
    const selectedEntityDetails = entities.find((entity) => entity.id === value)

    if (showFundSelector && selectedEntityDetails.type === "fund") {
      form.reset({
        ...form.getValues(),
        fundName: selectedEntityDetails.name,
        fundByline: selectedEntityDetails.byline,
        fundStreet: selectedEntityDetails.street,
        fundCityStateZip: selectedEntityDetails.city_state_zip,
      })

      const { data: investorData, error: investorError } = await supabase
        .from("users")
        .select("name, title, email")
        .eq("id", selectedEntityDetails.investor_id)
      if (investorError) throw investorError
      form.reset({
        ...form.getValues(),
        investorName: investorData[0].name,
        investorTitle: investorData[0].title,
        investorEmail: investorData[0].email,
      })
    } else if (
      showCompanySelector &&
      selectedEntityDetails.type === "company"
    ) {
      form.reset({
        ...form.getValues(),
        companyName: selectedEntityDetails.name,
        companyStreet: selectedEntityDetails.street,
        companyCityStateZip: selectedEntityDetails.city_state_zip,
        stateOfIncorporation: selectedEntityDetails.state_of_incorporation,
      })
      const { data: founderData, error: founderError } = await supabase
        .from("users")
        .select("name, title, email")
        .eq("id", selectedEntityDetails.founder_id)
      if (founderError) throw founderError
      form.reset({
        ...form.getValues(),
        founderName: founderData[0].name,
        founderTitle: founderData[0].title,
        founderEmail: founderData[0].email,
      })
    }
  }

  async function processStepOne() {
    setIsLoadingSave(true)
    const values = form.getValues()
    const investorId = await processInvestorDetails(values)
    const fundId = await processFundDetails(values, investorId)

    if (investorId || fundId) {
      await processInvestment(values, investorId, fundId, null, null)
    }
    setIsLoadingSave(false)
  }

  async function saveStepOne() {
    if (isEditMode) {
      toast({
        description: "Investment updated",
      })
      router.push("/investments")
    }
    await processStepOne()
    router.refresh()
  }

  async function advanceStepOne() {
    setStep(2)
  }

  async function processStepTwo() {
    setIsLoadingSave(true)
    const values = form.getValues()
    const founderId = await processFounderDetails(values)
    const companyId = await processCompanyDetails(values, founderId)
    if (founderId || companyId) {
      await processInvestment(values, null, null, founderId, companyId)
    }
    setIsLoadingSave(false)
  }

  async function saveStepTwo() {
    if (isEditMode) {
      toast({
        description: "Investment updated",
      })
      router.push("/investments")
    }
    if (isFormLocked) {
      setShowConfetti(true)
      toast({
        title: "Congratulations!",
        description:
          "Your information has been saved. You'll receive an email with the next steps once all parties have provided their information.",
      })
      try {
        await processStepTwo()
      } finally {
        setShowConfetti(false)
      }
      router.push("/investments")
    } else {
      await processStepTwo()
    }
    router.refresh()
  }

  async function advanceStepTwo() {
    setStep(3)
  }

  return (
    <div className="flex flex-col items-left min-h-screen py-2 w-4/5">
      <AuthRefresh />
      {showConfetti && <Confetti />}
      <h1 className="text-2xl font-bold">Get Started</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          {step === 1 && (
            <>
              <div className="pt-4 flex justify-between items-center h-10">
                <Label className="text-md font-bold">Investor Details</Label>
              </div>
              {showFundSelector &&
                entities.some((entity) => entity.type === "fund") && (
                  <FormItem>
                    <FormLabel>Select Entity</FormLabel>
                    <EntitySelector
                      entities={entities}
                      selectedEntity={selectedEntity}
                      onSelectChange={handleSelectChange}
                      entityType="fund"
                      disabled={!isOwner}
                    />
                    <FormDescription>
                      Choose an existing fund to be used in your signature block
                      or add one below
                    </FormDescription>
                  </FormItem>
                )}
              <FormField
                control={form.control}
                name="fundName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isOwner} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.fundName}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fundByline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Byline (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={!isOwner} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.fundByline}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fundStreet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isOwner} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.fundStreet}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fundCityStateZip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City, State, ZIP Code</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isOwner} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.fundCityStateZip}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-4">
                <Label className="text-md font-bold">Signatory Details</Label>
              </div>
              <FormField
                control={form.control}
                name="investorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investor Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isOwner} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.investorName}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="investorTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investor Title</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isOwner} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.investorTitle}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="investorEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investor Email</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isOwner} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.investorEmail}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2">
                {(isEditMode || isFormLocked) && (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={saveStepOne}
                  >
                    {isLoadingSave ? <Icons.spinner /> : "Save step one"}
                  </Button>
                )}
                <Button
                  type="button"
                  className="w-full"
                  onClick={advanceStepOne}
                  variant={isEditMode || isFormLocked ? "secondary" : "default"}
                >
                  Next
                </Button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="pt-4 flex justify-between items-center h-10">
                <Label className="text-md font-bold">Company Details</Label>
                {!isFormLocked && investmentId && (
                  <Share
                    investmentId={investmentId}
                    onEmailSent={() => handleStepChange(3)}
                  />
                )}
              </div>
              {showCompanySelector &&
                entities.some((entity) => entity.type === "company") && (
                  <FormItem>
                    <FormLabel>Select Entity</FormLabel>
                    <EntitySelector
                      entities={entities}
                      selectedEntity={selectedEntity}
                      onSelectChange={handleSelectChange}
                      entityType="company"
                      disabled={false}
                    />
                    <FormDescription>
                      Choose an existing company to be used in your signature
                      block or add one below
                    </FormDescription>
                  </FormItem>
                )}
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.companyName}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyStreet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.companyStreet}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyCityStateZip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City, State, ZIP Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.companyCityStateZip}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stateOfIncorporation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State of Incorporation</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.stateOfIncorporation}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-4">
                <Label className="text-md font-bold">Signatory Details</Label>
              </div>
              <FormField
                control={form.control}
                name="founderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Founder Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.founderName}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="founderTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Founder Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.founderTitle}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="founderEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Founder Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.founderEmail}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2">
                {(isEditMode || isFormLocked) && (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={saveStepTwo}
                  >
                    {isLoadingSave ? <Icons.spinner /> : "Save"}
                  </Button>
                )}
                <div className="flex w-full gap-2">
                  <Button
                    variant="secondary"
                    className="w-1/2"
                    onClick={() => {
                      setStep(1)
                    }}
                  >
                    Back{" "}
                  </Button>
                  <Button
                    type="button"
                    className="w-1/2"
                    variant={
                      isEditMode || isFormLocked ? "secondary" : "default"
                    }
                    onClick={advanceStepTwo}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="pt-4 flex justify-between items-center h-10">
                <Label className="text-md font-bold">Deal Terms</Label>
              </div>
              <FormField
                control={form.control}
                name="purchaseAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Amount</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isOwner}
                        value={Number(
                          field.value.replace(/,/g, "")
                        ).toLocaleString()}
                        onChange={(event) => {
                          const value = event.target.value
                            .replace(/\D/g, "")
                            .replace(/,/g, "")
                          field.onChange(Number(value).toLocaleString())
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.purchaseAmount}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!isOwner}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an investment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="valuation-cap">
                          Valuation Cap
                        </SelectItem>
                        <SelectItem value="discount">Discount</SelectItem>
                        <SelectItem value="mfn">MFN</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {formDescriptions.investmentType}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("type") === "valuation-cap" && (
                <FormField
                  control={form.control}
                  name="valuationCap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valuation Cap</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!isOwner}
                          value={Number(
                            field.value?.replace(/,/g, "")
                          ).toLocaleString()}
                          onChange={(event) => {
                            const value = event.target.value
                              .replace(/\D/g, "")
                              .replace(/,/g, "")
                            field.onChange(Number(value).toLocaleString())
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        {formDescriptions.valuationCap}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {form.watch("type") === "discount" && (
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isOwner} />
                      </FormControl>
                      <FormDescription>
                        {formDescriptions.discount}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            disabled={!isOwner}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>{formDescriptions.date}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isOwner && (
                <>
                  <div className="pt-4 flex justify-between items-center h-10">
                    <Label className="text-md font-bold">
                      Side Letter (Optional)
                    </Label>
                  </div>
                  <FormField
                    control={form.control}
                    name="infoRights"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Information Rights
                          </FormLabel>
                          <FormDescription>
                            {formDescriptions.infoRights}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="proRataRights"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Pro Rata Rights
                          </FormLabel>
                          <FormDescription>
                            {formDescriptions.proRataRights}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="majorInvestorRights"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Major Investor Rights
                          </FormLabel>
                          <FormDescription>
                            {formDescriptions.majorInvestorRights}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="termination"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Termination Rights
                          </FormLabel>
                          <FormDescription>
                            {formDescriptions.termination}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="miscellaneous"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Miscellaneous
                          </FormLabel>
                          <FormDescription>
                            {formDescriptions.miscellaneous}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full">
                  {isEditMode || isFormLocked ? "Save" : "Submit"}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
              </div>
            </>
          )}
        </form>
      </Form>
    </div>
  )
}
