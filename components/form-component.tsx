"use client"

import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import Docxtemplater from "docxtemplater"
import PizZip from "pizzip"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"

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
import { toast } from "./ui/use-toast"

const FormComponentSchema = z.object({
  founderName: z.string().min(3, { message: "Name is required" }),
  founderTitle: z.string({ required_error: "Title is required" }),
  founderEmail: z.string().email().optional(),
  companyName: z.string({ required_error: "Company name is required" }),
  companyStreet: z.string().optional(),
  companyCityStateZip: z.string().optional(),
  stateOfIncorporation: z.string({
    required_error: "State of incorporation is required",
  }),
  date: z.date({ required_error: "Date is required" }),
  investorName: z.string({ required_error: "Investor name is required" }),
  investorByline: z.string().optional(),
  purchaseAmount: z.string({ required_error: "Purchase amount is required" }),
  type: z.enum(["valuation-cap", "discount"]),
  valuationCap: z.string().optional(),
  discount: z.string().optional(),
})

type FormComponentValues = z.infer<typeof FormComponentSchema>

export default function FormComponent() {
  const form = useForm<FormComponentValues>({
    resolver: zodResolver(FormComponentSchema),
    defaultValues: {
      founderName: "",
      founderTitle: "",
      founderEmail: "",
      companyName: "",
      companyStreet: "",
      companyCityStateZip: "",
      stateOfIncorporation: "",
      date: new Date(),
      investorName: "",
      investorByline: "",
      purchaseAmount: "",
      type: "valuation-cap",
      valuationCap: "",
      discount: "",
    },
  })

  const [step, setStep] = useState(1)

  const formDescriptions = {
    founderName: "The name of the company's signatory",
    founderTitle: "The title of the company's signatory",
    founderEmail: "The email of the company's signatory",
    companyName: "The name of the company",
    companyStreet: "The street address of the company",
    companyCityStateZip: "The city, state, and ZIP code of the company",
    stateOfIncorporation: "The state of incorporation of the company",
    date: "The approximate date of the SAFE agreement",
    investorName: "The name of the investing entity",
    investorByline: "The byline for the investing entity (optional)",
    purchaseAmount: "The amount being invested",
    investmentType: "The type of SAFE agreement (valuation cap or discount)",
    valuationCap: "The valuation cap of the investment",
    discount: "The discount of the investment",
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
    }
    const response = await fetch(`/${templateFileName}`)
    const arrayBuffer = await response.arrayBuffer()
    const zip = new PizZip(arrayBuffer)

    // Create a docxtemplater instance and load the zip
    const doc = new Docxtemplater().loadZip(zip)

    // Set the template variables
    doc.setData({
      company_name: values.companyName,
      investor_name: values.investorName,
      byline: values.investorByline || "",
      purchase_amount: values.purchaseAmount,
      state_of_incorporation: values.stateOfIncorporation,
      valuation_cap: values.valuationCap || "",
      date: formattedDate,
      founder_name: values.founderName,
      founder_title: values.founderTitle,
      founder_email: values.founderEmail || "",
      company_address_1: values.companyStreet || "",
      company_address_2: values.companyCityStateZip || "",
      discount: values.discount
        ? (100 - Number(values.discount)).toString()
        : "",
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
        : "YC-SAFE-Discount.docx"
    link.click()

    // Clean up the download URL
    setTimeout(() => {
      URL.revokeObjectURL(link.href)
    }, 100)

    // Toast and reset form
    toast({
      title: "Your SAFE agreement has been generated",
      description: "You can find it in your Downloads",
    })
    resetForm()
  }

  function resetForm() {
    form.reset()
    form.setValue("date", new Date())
    setStep(1) // Reset step to 1 when form is reset
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-2 w-2/3 mx-auto">
      <h1 className="text-4xl font-bold mb-4">Your Information</h1>
      <h3 className="text-sm text-gray-500 mb-4">
        We just need a few details to get started
      </h3>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          {step === 1 && (
            <>
              <Label className="text-md font-bold">Founder Information</Label>
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
              <div className="pt-4">
                <Label className="text-md font-bold">Company Information</Label>
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
                    <FormLabel>City, State, ZIP</FormLabel>
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
                <Label className="text-md font-bold">Investor Information</Label>
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
                name="investorByline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investor Byline</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.investorByline}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-4">
                <Label className="text-md font-bold">Deal Information</Label>
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
                  onClick={() => setStep(1)}
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
