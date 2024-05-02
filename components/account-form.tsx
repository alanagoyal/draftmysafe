"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
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
  type: z.enum(["founder", "investor"], {
    required_error: "You need to select a signatory type.",
  }),
  email: z.string().email(),
  name: z.string().min(2),
  title: z.string().min(2),
  fundName: z.string().optional(),
  fundByline: z.string().optional(),
  fundStreet: z.string().optional(),
  fundCityStateZip: z.string().optional(),
  companyName: z.string().optional(),
  stateOfIncorporation: z.string().optional(),
  companyStreet: z.string().optional(),
  companyCityStateZip: z.string().optional(),
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
  const [fundData, setFundData] = useState<any>({})
  const [companyData, setCompanyData] = useState<any>({})

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      type: userData.type || "",
      email: userData.email || "",
      name: userData.name || "",
      title: userData.title || "",
      fundName: fundData.name || "",
      fundByline: fundData.byline || "",
      fundStreet: fundData.street || "",
      fundCityStateZip: fundData.city_state_zip || "",
      companyName: companyData.name || "",
      stateOfIncorporation: companyData.state_of_incorporation || "",
      companyStreet: companyData.street || "",
      companyCityStateZip: companyData.city_state_zip || "",
    },
  })

  useEffect(() => {
    if (userData) {
      getFundData()
      getCompanyData()
    }
  }, [userData])

  async function getFundData() {
    const { data: fundData, error } = await supabase
      .from("funds")
      .select("*")
      .eq("investor_id", userData.id)
    if (error) throw error
    setFundData(fundData || {})
  }

  async function getCompanyData() {
    const { data: companyData, error } = await supabase
      .from("companies")
      .select("*")
      .eq("founder_id", userData.id)
    if (error) throw error
    setCompanyData(companyData || {})
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

      // Process fund or company updates
      if (data.type === "investor") {
        await processInvestorFund(data)
      } else if (data.type === "founder") {
        await processFounderCompany(data)
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

  async function processInvestorFund(data: AccountFormValues) {
    const { data: existingFund, error: fundError } = await supabase
      .from("funds")
      .select("*")
      .eq("investor_id", userData.id)
      .eq("name", data.fundName) // Use more fields if necessary for unique identification
      .single()

    const fundUpdates = {
      investor_id: userData.id,
      name: data.fundName,
      byline: data.fundByline,
      street: data.fundStreet,
      city_state_zip: data.fundCityStateZip,
    }

    if (existingFund) {
      // Update existing fund
      let { error: updateError } = await supabase
        .from("funds")
        .update(fundUpdates)
        .eq("id", existingFund.id)
      if (updateError) throw updateError
    } else {
      // Insert new fund
      let { error: insertError } = await supabase
        .from("funds")
        .insert(fundUpdates)
      if (insertError) throw insertError
    }
  }

  async function processFounderCompany(data: AccountFormValues) {
    const { data: existingCompany, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("founder_id", userData.id)
      .eq("name", data.companyName) // Adjust fields for unique identification
      .single()

    const companyUpdates = {
      founder_id: userData.id,
      name: data.companyName,
      state_of_incorporation: data.stateOfIncorporation,
      street: data.companyStreet,
      city_state_zip: data.companyCityStateZip,
    }

    if (existingCompany) {
      // Update existing company
      let { error: updateError } = await supabase
        .from("companies")
        .update(companyUpdates)
        .eq("id", existingCompany.id)
      if (updateError) throw updateError
    } else {
      // Insert new company
      let { error: insertError } = await supabase
        .from("companies")
        .insert(companyUpdates)
      if (insertError) throw insertError
    }
  }

  const renderAdditionalFields = (type: string) => {
    if (type === "investor") {
      return (
        <>
          <FormField
            control={form.control}
            name="fundName"
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
            name="fundByline"
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
            name="fundStreet"
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
        </>
      )
    } else if (type === "founder") {
      return (
        <>
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
        </>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-2 w-2/3">
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          {renderAdditionalFields(form.watch("type"))}
          <div className="py-1 flex justify-center w-full">
            <Button className="w-full" type="submit">
              Update
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
