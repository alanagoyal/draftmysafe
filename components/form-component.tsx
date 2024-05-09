"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import Docxtemplater from "docxtemplater"
import PizZip from "pizzip"
import Confetti from "react-confetti"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { cn, formDescriptions } from "@/lib/utils"

import { EntitySelector } from "./entity-selector"
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
  companyName: z.string({ required_error: "Company name is required" }),
  fundName: z.string({
    required_error: "Investing entity name is required",
  }),
  fundByline: z.string().optional(),
  purchaseAmount: z.string({ required_error: "Purchase amount is required" }),
  type: z.enum(["valuation-cap", "discount", "mfn"]),
  valuationCap: z.string().optional(),
  discount: z.string().optional(),
  stateOfIncorporation: z.string({
    required_error: "State of incorporation is required",
  }),
  date: z.date({ required_error: "Date is required" }),
  investorName: z.string().optional(),
  investorTitle: z.string().optional(),
  investorEmail: z.string().email().optional(),
  fundStreet: z.string().optional(),
  fundCityStateZip: z.string().optional(),
  founderName: z.string().min(3, { message: "Name is required" }),
  founderTitle: z.string({ required_error: "Title is required" }),
  founderEmail: z.string().email().optional(),
  companyStreet: z.string().optional(),
  companyCityStateZip: z.string().optional(),
})

type FormComponentValues = z.infer<typeof FormComponentSchema>

export default function FormComponent({ userData }: { userData: any }) {
  const supabase = createClient()

  const form = useForm<FormComponentValues>({
    resolver: zodResolver(FormComponentSchema),
    defaultValues: {
      companyName: "",
      fundName: "",
      fundByline: "",
      purchaseAmount: "",
      type: "valuation-cap",
      valuationCap: "",
      discount: "",
      stateOfIncorporation: "",
      date: new Date(),
      investorName: userData.type === "investor" ? userData.name : "",
      investorTitle: userData.type === "investor" ? userData.title : "",
      investorEmail: userData.type === "investor" ? userData.email : "",
      fundStreet: "",
      fundCityStateZip: "",
      founderName: userData.type === "founder" ? userData.name : "",
      founderTitle: userData.type === "founder" ? userData.title : "",
      founderEmail: userData.type === "founder" ? userData.email : "",
      companyStreet: "",
      companyCityStateZip: "",
    },
  })

  const [step, setStep] = useState(1)
  const [showConfetti, setShowConfetti] = useState(false)
  const [entities, setEntities] = useState<any[]>([])
  const [selectedEntity, setSelectedEntity] = useState("")

  useEffect(() => {
    if (userData) {
      fetchEntities()
    }
  }, [userData])

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
    // Format date
    const date = new Date(values.date)
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

    // Load the docx template based on the investment type
    let templateFileName = ""
    if (values.type === "valuation-cap") {
      templateFileName = "SAFE-Valuation-Cap.docx"
    } else if (values.type === "discount") {
      templateFileName = "SAFE-Discount.docx"
    } else if (values.type === "mfn") {
      templateFileName = "SAFE-MFN.docx"
    }
    const response = await fetch(`/${templateFileName}`)
    const arrayBuffer = await response.arrayBuffer()
    const zip = new PizZip(arrayBuffer)

    // Create a docxtemplater instance and load the zip
    const doc = new Docxtemplater().loadZip(zip)

    // Set the template variables
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

    // Render the document
    doc.render()

    // Get the updated Word file content
    const updatedContent = doc.getZip().generate({ type: "blob" })

    // Create a download link and click it to start the download
    const link = document.createElement("a")
    link.href = URL.createObjectURL(updatedContent)
    link.download =
      values.type === "valuation-cap"
        ? "YC-SAFE-Valuation-Cap.docx"
        : values.type === "discount"
        ? "YC-SAFE-Discount.docx"
        : "YC-SAFE-MFN.docx"
    link.click()

    // Clean up the download URL
    setTimeout(() => {
      URL.revokeObjectURL(link.href)
    }, 100)

    // Start confetti
    setShowConfetti(true)

    // Stop confetti after 3 seconds
    setTimeout(() => {
      setShowConfetti(false)
    }, 10000)

    // Insert into investments table
    try {
      // Check if the investor already exists
      let investorData = await supabase
        .from("users")
        .select("id")
        .eq("email", values.investorEmail)

      let investorId
      if (investorData.data) {
        investorId = investorData.data[0].id
      } else {
        const { data, error } = await supabase
          .from("users")
          .insert({
            name: values.investorName,
            title: values.investorTitle,
            email: values.investorEmail,
          })
          .select("id")
        if (error) throw error
        investorId = data[0].id
      }

      // Check if the founder already exists
      let founderData = await supabase
        .from("users")
        .select("id")
        .eq("email", values.founderEmail)

      let founderId
      if (founderData.data && founderData.data.length > 0) {
        founderId = founderData.data[0].id
      } else {
        const { data, error } = await supabase
          .from("users")
          .insert({
            name: values.founderName,
            title: values.founderTitle,
            email: values.founderEmail,
          })
          .select("id")
        if (error) throw error
        founderId = data[0].id
      }

      // Insert fund and company data using the ids
      let fundId
      const fundData = {
        name: values.fundName,
        byline: values.fundByline,
        street: values.fundStreet,
        city_state_zip: values.fundCityStateZip,
        investor_id: investorId,
      }
      const { data: fundInsertData, error: fundInsertError } = await supabase
        .from("funds")
        .insert(fundData)
        .select("id")
      if (fundInsertError) throw fundInsertError
      fundId = fundInsertData[0].id

      let companyId
      const companyData = {
        name: values.companyName,
        street: values.companyStreet,
        city_state_zip: values.companyCityStateZip,
        state_of_incorporation: values.stateOfIncorporation,
        founder_id: founderId,
      }
      const { data: companyInsertData, error: companyInsertError } =
        await supabase.from("companies").insert(companyData).select("id")
      if (companyInsertError) throw companyInsertError
      companyId = companyInsertData[0].id

      // Insert into investments table with all linked ids
      const investmentData = {
        founder_id: founderId,
        company_id: companyId,
        investor_id: investorId,
        fund_id: fundId,
        purchase_amount: values.purchaseAmount,
        investment_type: values.type,
        valuation_cap: values.valuationCap,
        discount: values.discount,
        date: values.date,
        created_by: userData.auth_id,
      }
      const { data: investmentInsertData, error: investmentInsertError } =
        await supabase.from("investments").insert(investmentData)
      if (investmentInsertError) throw investmentInsertError
    } catch (error) {
      console.error("Error during database operation:", error)
    } finally {
      // Toast and reset form
      toast({
        title: "Congratulations!",
        description:
          "Your SAFE agreement has been generated and can be found in your Downloads",
      })
      resetForm()
    }
  }

  function resetForm() {
    form.reset()
    form.setValue("date", new Date())
    setStep(1) // Reset step to 1 when form is reset
  }

  function handleSelectChange(value: string) {
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
    } else if (selectedEntityDetails.type === "company") {
      form.reset({
        ...form.getValues(),
        companyName: selectedEntityDetails.name,
        companyStreet: selectedEntityDetails.street,
        companyCityStateZip: selectedEntityDetails.city_state_zip,
        stateOfIncorporation: selectedEntityDetails.state_of_incorporation,
      })
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-2 w-2/3">
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
                addEntities={false}
              />
              <FormDescription>
                Choose a signature block for this deal
              </FormDescription>
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
                onClick={() => setStep(2)}
              >
                Next
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <div className="pt-4">
                <Label className="text-md font-bold">Company Details</Label>
              </div>
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
                  onClick={() => setStep(3)}
                >
                  Next
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
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
