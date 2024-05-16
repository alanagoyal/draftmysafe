"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import Confetti from "react-confetti"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { cn, formDescriptions } from "@/lib/utils"

import AuthRefresh from "./auth-refresh"
import { EntitySelector } from "./entity-selector"
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Textarea } from "./ui/textarea"
import { toast } from "./ui/use-toast"

const FormComponentSchema = z.object({
  companyName: z.string().optional(),
  fundName: z.string().optional(),
  fundByline: z.string().optional(),
  purchaseAmount: z.string({ required_error: "Purchase amount is required" }),
  type: z.enum(["", "valuation-cap", "discount", "mfn"]),
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
})

type FormComponentValues = z.infer<typeof FormComponentSchema>

type InvestmentData = {
  founder_id?: string
  company_id?: string
  investor_id?: string
  fund_id?: string
  purchase_amount: string
  investment_type: "" | "valuation-cap" | "discount" | "mfn"
  valuation_cap?: string
  discount?: string
  date: Date
  created_by?: string
}

export default function FormComponent({ userData }: { userData: any }) {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(parseInt(searchParams.get("step") || "1"))
  const [investmentId, setInvestmentId] = useState<string | null>(
    searchParams.get("id") || null
  )
  const [showConfetti, setShowConfetti] = useState(false)
  const [entities, setEntities] = useState<any[]>([])
  const [selectedEntity, setSelectedEntity] = useState("")
  const isFormLocked = searchParams.get("sharing") === "true"

  const form = useForm<FormComponentValues>({
    resolver: zodResolver(FormComponentSchema),
    defaultValues: {
      companyName: "",
      fundName: "",
      fundByline: "",
      purchaseAmount: "",
      type: "",
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
    },
  })

  useEffect(() => {
    if (userData) {
      fetchEntities()
      if (isFormLocked) {
        form.reset({
          ...form.getValues(),
          founderEmail: userData.email, // Assuming userData.email holds the authenticated user's email
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
        founder:users!founder_id (name, title, email),
        company:companies (id, name, street, city_state_zip, state_of_incorporation),
        investor:users!investor_id (name, title, email),
        fund:funds (id, name, byline, street, city_state_zip)
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
        type: data.investment_type || "",
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
      })

      if (data.fund && data.fund.id) {
        setSelectedEntity(data.fund.id)
      } else if (data.company && data.company.id) {
        setSelectedEntity(data.company.id)
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
    // Check if the values are their default or empty values
    if (
      values.purchaseAmount === "" &&
      values.type === ""
    ) {
      toast({
        title: "Unable to create SAFE agreement",
        description:
          "You must enter valid purchase amount, investment type, and date.",
      })
      return
    }
    await processInvestment(values, null, null, null, null)

    setShowConfetti(true)
    toast({
      title: "Your SAFE agreement has been created",
      description:
        "You can view, edit, or download it by visiting your Investments.",
    })
    setTimeout(() => {
      setShowConfetti(false)
      router.push("/investments")
    }, 5000)
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

  async function processInvestment(
    values: FormComponentValues,
    investorId: string | null,
    fundId: string | null,
    founderId: string | null,
    companyId: string | null
  ) {
    try {
      // Prepare investment data with non-null values
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

      // If hasn't been added to investments table, add it
      if (!investmentId) {
        // Set created_by only when creating a new investment
        investmentData.created_by = userData.auth_id
        const { data: investmentInsertData, error: investmentInsertError } =
          await supabase.from("investments").insert(investmentData).select()
        if (investmentInsertError) throw investmentInsertError
        setInvestmentId(investmentInsertData[0].id)
      } else {
        // If it has been added, update it without changing the created_by
        const { data: investmentUpdateData, error: investmentUpdateError } =
          await supabase
            .from("investments")
            .upsert({ ...investmentData, id: investmentId })
            .select()
        if (investmentUpdateError) throw investmentUpdateError
        setInvestmentId(investmentUpdateData[0].id)
      }
    } catch (error) {
      console.error("Error processing investment details:", error)
    }
  }

  async function handleSelectChange(value: string) {
    setSelectedEntity(value)

    const selectedEntityDetails = entities.find((entity) => entity.id === value)

    if (selectedEntityDetails.type === "fund") {
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
    } else if (selectedEntityDetails.type === "company") {
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

  async function advanceStepOne() {
    const values = form.getValues()
    const investorId = await processInvestorDetails(values)
    const fundId = await processFundDetails(values, investorId)
    if (investorId || fundId) {
      await processInvestment(values, investorId, fundId, null, null)
    }
    if (!isFormLocked) {
      setStep(2) // Move to the next step only after processing is complete
    }
  }

  async function advanceStepTwo() {
    const values = form.getValues()
    const founderId = await processFounderDetails(values)
    const companyId = await processCompanyDetails(values, founderId)
    if (founderId || companyId) {
      await processInvestment(values, null, null, founderId, companyId)
    }
    if (!isFormLocked) {
      setStep(3) // Move to the next step only after processing is complete

      // If being shared
    } else {
      setShowConfetti(true)
      setTimeout(() => {
        setShowConfetti(false)
      }, 10000)
      toast({
        title: "Congratulations!",
        description:
          "Your information has been saved. You'll receive an email with the next steps shortly.",
      })
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-2 w-2/3">
      <AuthRefresh />
      {showConfetti && <Confetti />}
      <h1 className="text-4xl font-bold mb-4">Get Started</h1>
      <h3 className="text-sm text-gray-500 mb-4">
        Your next unicorn investment is just a few clicks away
      </h3>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          {step === 1 && (
            <>
              <div className="pt-4">
                <Label className="text-md font-bold">Investor Details</Label>
              </div>
              <EntitySelector
                entities={entities}
                selectedEntity={selectedEntity}
                onSelectChange={handleSelectChange}
                entityType="fund"
              />
              <FormField
                control={form.control}
                name="fundName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Textarea {...field} />
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
                      <Input {...field} />
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
                    <FormLabel>City, State, Zip Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.investorEmail}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                className="mt-4 w-full"
                onClick={advanceStepOne}
              >
                {isFormLocked ? "Save" : "Next"}
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <div className="pt-4 flex justify-between items-center">
                <Label className="text-md font-bold">Company Details</Label>
                {!isFormLocked && (
                  <Share
                    idString={
                      typeof window !== "undefined"
                        ? `${window.location.origin}/new?id=${investmentId}&step=${step}&sharing=true`
                        : ""
                    }
                  />
                )}
              </div>
              <EntitySelector
                entities={entities}
                selectedEntity={selectedEntity}
                onSelectChange={handleSelectChange}
                entityType="company"
              />
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
                    <FormLabel>City, State, Zip Code</FormLabel>
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
                <Button
                  type="button"
                  className="w-full"
                  onClick={advanceStepTwo}
                >
                  {isFormLocked ? "Save" : "Next"}
                </Button>
                {!isFormLocked ? (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                ) : null}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="pt-4">
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
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Placement</SelectLabel>
                          <SelectItem value="valuation-cap">
                            Valuation Cap
                          </SelectItem>
                          <SelectItem value="discount">Discount</SelectItem>
                          <SelectItem value="mfn">MFN</SelectItem>
                        </SelectGroup>
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
                        <Input {...field} />
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
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full">
                  Submit
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
