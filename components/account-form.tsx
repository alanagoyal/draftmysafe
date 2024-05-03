"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@radix-ui/react-label"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { formDescriptions } from "@/lib/utils"

import { Button } from "./ui/button"
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
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Textarea } from "./ui/textarea"
import { toast } from "./ui/use-toast"

const accountFormSchema = z.object({
  type: z.enum(["founder", "investor"]),
  email: z.string().email(),
  name: z.string().min(2),
  title: z.string().min(2),
  funds: z.array(
    z
      .object({
        name: z.string().optional(),
        byline: z.string().optional(),
        street: z.string().optional(),
        city_state_zip: z.string().optional(),
      })
      .optional()
  ),
  companies: z.array(
    z
      .object({
        name: z.string().optional(),
        state_of_incorporation: z.string().optional(),
        street: z.string().optional(),
        city_state_zip: z.string().optional(),
      })
      .optional()
  ),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

export default function AccountForm({
  user,
  userData,
}: {
  user: any
  userData: any
}) {
  const supabase = createClient()
  const [fundData, setFundData] = useState<any[]>([
    { name: "", byline: "", street: "", city_state_zip: "" },
  ])
  const [companyData, setCompanyData] = useState<any[]>([
    { name: "", state_of_incorporation: "", street: "", city_state_zip: "" },
  ])

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      type: userData.type || "",
      email: userData.email || "",
      name: userData.name || "",
      title: userData.title || "",
      funds: fundData || [
        { name: "", byline: "", street: "", city_state_zip: "" },
      ],
      companies: companyData || [
        {
          name: "",
          state_of_incorporation: "",
          street: "",
          city_state_zip: "",
        },
      ],
    },
  })

  useEffect(() => {
    form.reset({ ...form.getValues() }) // This ensures the form reflects the state
  }, [userData])

  useEffect(() => {
    if (userData && userData.type === "investor") {
      fetchFunds()
    } else if (userData && userData.type === "founder") {
      fetchCompanies()
    }
  }, [userData])

  const fetchFunds = async () => {
    const { data, error } = await supabase
      .from("funds")
      .select("*")
      .eq("investor_id", userData.id)
    if (error) {
      toast({ variant: "destructive", description: "Failed to fetch funds" })
      console.error(error)
    } else {
      const sanitizedData = data.map((fund) => ({
        name: fund.name || "",
        byline: fund.byline || "",
        street: fund.street || "",
        city_state_zip: fund.city_state_zip || "",
      }))
      setFundData(sanitizedData)
      form.reset({ ...form.getValues(), funds: sanitizedData })
    }
  }

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("founder_id", userData.id)
    if (error) {
      toast({
        variant: "destructive",
        description: "Failed to fetch companies",
      })
      console.error(error)
    } else {
      const sanitizedData = data.map((company) => ({
        name: company.name || "",
        state_of_incorporation: company.state_of_incorporation || "",
        street: company.street || "",
        city_state_zip: company.city_state_zip || "",
      }))
      setCompanyData(sanitizedData)
      form.reset({ ...form.getValues(), companies: sanitizedData })
    }
  }

  async function onSubmit(data: AccountFormValues) {
    try {
      // Update account
      const accountUpdates = {
        type: data.type,
        email: userData.email,
        name: data.name,
        title: data.title,
        updated_at: new Date(),
      }

      let { error: accountError } = await supabase
        .from("users")
        .update(accountUpdates)
        .eq("auth_id", user.id)
      if (accountError) throw accountError

      // Handle funds and companies based on the type
      if (data.type === "investor") {
        await Promise.all(
          data.funds.map((fund) =>
            processFund({ ...fund, investor_id: userData.id })
          )
        )
      } else {
        await Promise.all(
          data.companies.map((company) =>
            processCompany({ ...company, founder_id: userData.id })
          )
        )
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        description: "Error updating account",
      })
    } finally {
      toast({
        description: "Account updated",
      })
    }
  }

  async function processFund(fund) {
    const { data: existingFund, error } = await supabase
      .from("funds")
      .select("*")
      .eq("investor_id", fund.investor_id)
      .eq("name", fund.name)

    if (error) {
      console.error("Error fetching fund:", error)
      throw error
    }

    if (existingFund && existingFund.length > 0) {
      const { error: updateError } = await supabase
        .from("funds")
        .update(fund)
        .eq("id", existingFund[0].id)
      if (updateError) {
        console.error("Error updating fund:", updateError)
        throw updateError
      }
    } else {
      const { error: insertError } = await supabase.from("funds").insert(fund)
      if (insertError) {
        console.error("Error inserting fund:", insertError)
        throw insertError
      }
    }
  }

  async function processCompany(company) {
    const { data: existingCompany, error } = await supabase
      .from("companies")
      .select("*")
      .eq("founder_id", company.founder_id)
      .eq("name", company.name)

    if (error) {
      console.error("Error fetching company:", error)
      throw error
    }

    if (existingCompany && existingCompany.length > 0) {
      const { error: updateError } = await supabase
        .from("companies")
        .update(company)
        .eq("id", existingCompany[0].id)
      if (updateError) throw updateError
    } else {
      const { error: insertError } = await supabase
        .from("companies")
        .insert(company)
      if (insertError) throw insertError
    }
  }

  const renderAdditionalFields = (type: string) => {
    if (type === "investor") {
      return fundData.map((fund, index) => (
        <React.Fragment key={`fund-${index}`}>
        <div className={index === 0 ? "pt-0" : "pt-4"}>
            <Label className="text-sm font-bold">{fund.name || "New Fund"}</Label>
          </div>
          <FormField
            control={form.control}
            name={`funds.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entity Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>{formDescriptions.fundName}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`funds.${index}.byline`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Byline (Optional)</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormDescription>{formDescriptions.fundByline}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`funds.${index}.street`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>{formDescriptions.fundStreet}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`funds.${index}.city_state_zip`}
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
        </React.Fragment>
      ))
    } else if (type === "founder") {
      return companyData.map((company, index) => (
        <React.Fragment key={`company-${index}`}>
        <div className={index === 0 ? "pt-0" : "pt-4"}>
            <Label className="text-sm font-bold">{company.name || "New Company"}</Label>
          </div>
          <FormField
            control={form.control}
            name={`companies.${index}.name`}
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
            name={`companies.${index}.street`}
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
            name={`companies.${index}.city_state_zip`}
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
            name={`companies.${index}.state_of_incorporation`}
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
        </React.Fragment>
      ))
    }
    return null
  }

  const addNewFund = () => {
    setFundData([
      ...fundData,
      { name: "", byline: "", street: "", city_state_zip: "" },
    ])
  }

  const addNewCompany = () => {
    setCompanyData([
      ...companyData,
      { name: "", state_of_incorporation: "", street: "", city_state_zip: "" },
    ])
  }

  useEffect(() => {
    form.reset({ ...form.getValues(), funds: fundData, companies: companyData })
  }, [userData, fundData, companyData])

  return (
    <div className="flex flex-col items-center min-h-screen py-2 w-2/3">
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="pt-4">
            <Label className="text-md font-bold">
              {form.watch("type") === "investor"
                ? "Investor Details"
                : "Founder Details"}
            </Label>
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormDescription>
                  This is the email you log in with
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormDescription>
                  This is the name that will be displayed in the dashboard
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  This is the title that will be used in your signature block
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Signatory Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="founder" />
                      </FormControl>
                      <FormLabel className="font-normal">Founder</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="investor" />
                      </FormControl>
                      <FormLabel className="font-normal">Investor</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormDescription>
                  Please indicate your signatory type
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-4">
            <div className="pt-4">
              <Label className="text-md font-bold">
                {form.watch("type") === "investor"
                  ? "Fund Details"
                  : "Company Details"}
              </Label>
            </div>
            {renderAdditionalFields(form.watch("type"))}
            <div className="flex flex-col gap-2">
              {form.watch("type") === "investor" && (
                <Button variant="ghost" type="button" onClick={addNewFund}>
                  + New Fund
                </Button>
              )}
              {form.watch("type") === "founder" && (
                <Button variant="ghost" type="button" onClick={addNewCompany}>
                  + New Company
                </Button>
              )}
              <Button className="w-full" type="submit">
                Update
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
