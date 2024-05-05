"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@radix-ui/react-label"
import { Trash } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { formDescriptions } from "@/lib/utils"

import { Icons } from "./icons"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
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
type Fund = {
  id: string | null
  name: string
  byline: string
  street: string
  city_state_zip: string
}

type Company = {
  id: string | null
  name: string
  state_of_incorporation: string
  street: string
  city_state_zip: string
}

export default function AccountForm({
  user,
  userData,
}: {
  user: any
  userData: any
}) {
  const router = useRouter()
  const supabase = createClient()
  const [fundData, setFundData] = useState<any[]>([
    { id: null, name: "", byline: "", street: "", city_state_zip: "" },
  ])
  const [companyData, setCompanyData] = useState<any[]>([
    {
      id: null,
      name: "",
      state_of_incorporation: "",
      street: "",
      city_state_zip: "",
    },
  ])
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

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
    if (userData && userData.type === "investor") {
      fetchFunds()
    } else if (userData && userData.type === "founder") {
      fetchCompanies()
    }
  }, [])

  // Synchronize form values with fund and company data
  useEffect(() => {
    form.reset({ ...form.getValues(), funds: fundData, companies: companyData })
  }, [fundData, companyData])

  const fetchFunds = async () => {
    const { data, error } = await supabase
      .from("funds")
      .select("*")
      .eq("investor_id", userData.id)
      .order("created_at", { ascending: true }) // Order by created_at ascending
    if (error) {
      toast({ variant: "destructive", description: "Failed to fetch funds" })
      console.error(error)
    } else {
      const sanitizedData = data.map((fund) => ({
        id: fund.id,
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
      .order("created_at", { ascending: true }) // Order by created_at ascending
    if (error) {
      toast({
        variant: "destructive",
        description: "Failed to fetch companies",
      })
      console.error(error)
    } else {
      const sanitizedData = data.map((company) => ({
        id: company.id,
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
      router.refresh()
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

  // Function to delete a specific fund by index
  const deleteFund = async (index: number) => {
    const fundToDelete = fundData[index]
    if (fundToDelete && !fundToDelete.id.startsWith('temp-')) {
      // Fund is already in the database, so attempt to delete
      const { error } = await supabase
        .from("funds")
        .delete()
        .eq("id", fundToDelete.id)

      if (error) {
        toast({
          variant: "destructive",
          description: "Failed to delete the fund",
        })
        console.error("Error deleting fund:", error)
      } else {
        // Successfully deleted, update the state
        setFundData((prevFunds) => prevFunds.filter((_, i) => i !== index))
        toast({ description: "Fund deleted successfully" })
      }
    } else {
      // Fund isn't yet saved in the database, remove it locally
      setFundData((prevFunds) => prevFunds.filter((_, i) => i !== index))
    }
  }

  // Function to delete a specific company by index
  const deleteCompany = async (index: number) => {
    const companyToDelete = companyData[index]
    if (companyToDelete && !companyToDelete.id.startsWith('temp-')) {
      // Company is already in the database, so attempt to delete
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", companyToDelete.id)

      if (error) {
        toast({
          variant: "destructive",
          description: "Failed to delete the company.",
        })
        console.error("Error deleting company:", error)
      } else {
        // Successfully deleted, update the state
        setCompanyData((prevCompanies) =>
          prevCompanies.filter((_, i) => i !== index)
        )
        toast({ description: "Company deleted successfully." })
      }
    } else {
      // Company isn't yet saved in the database, remove it locally
      setCompanyData((prevCompanies) =>
        prevCompanies.filter((_, i) => i !== index)
      )
    }
  }

  const handleSelectFund = (fundId: string) => {
    const fund = fundData.find((f) => f.id === fundId)
    setSelectedFund(fund)
  }

  const handleSelectCompany = (companyId: string) => {
    const company = companyData.find((c) => c.id === companyId)
    setSelectedCompany(company)
  }

  const handleSelectChange = (value: string, type: string) => {
    if (value === "add-new") {
      type === "investor" ? addNewFund() : addNewCompany();
    } else {
      type === "investor" ? handleSelectFund(value) : handleSelectCompany(value);
    }
  };
  
  const renderFundsOrCompanies = (type: string) => {
    return (
      <Select onValueChange={(value) => handleSelectChange(value, type)}>
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={`Select a ${type === "investor" ? "fund" : "company"}`}
          />
        </SelectTrigger>
        <SelectContent>
          {type === "investor"
            ? fundData.map((fund, index) => (
                <SelectItem key={`fund-${index}`} value={fund.id}>
                  {fund.name}
                </SelectItem>
              ))
            : companyData.map((company, index) => (
                <SelectItem key={`company-${index}`} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
          <SelectItem key="add-new" value="add-new">
            + Add New {type === "investor" ? "Fund" : "Company"}
          </SelectItem>
        </SelectContent>
      </Select>
    );
  };
  
  const renderAdditionalFields = (type: string) => {
    if (type === "investor" && selectedFund !== null) {
      const index = fundData.findIndex((fund) => fund.id === selectedFund.id)
      if (index !== -1) {
        const fund = fundData[index]
        return (
          <React.Fragment key={`fund-${index}`}>
            <div
              className={`${
                index === 0 ? "pt-0" : "pt-4"
              } flex items-center justify-between`}
            >
              <Label className="text-sm font-bold">
                {fund.name || "New Fund"}
              </Label>
              <Button
                type="button"
                variant="ghost"
                onClick={() => deleteFund(index)}
              >
                <Icons.trash />
              </Button>
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
                  <FormDescription>
                    {formDescriptions.fundByline}
                  </FormDescription>
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
                  <FormDescription>
                    {formDescriptions.fundStreet}
                  </FormDescription>
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
        )
      }
    } else if (type === "founder" && selectedCompany !== null) {
      const index = companyData.findIndex(
        (company) => company.id === selectedCompany.id
      )
      if (index !== -1) {
        const company = companyData[index]
        return (
          <React.Fragment key={`company-${index}`}>
            <div
              className={`${
                index === 0 ? "pt-0" : "pt-4"
              } flex items-center justify-between`}
            >
              <Label className="text-sm font-bold">
                {company.name || "New Company"}
              </Label>
              <Button variant="ghost" onClick={() => deleteCompany(index)}>
                <Icons.trash />
              </Button>
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
        )
      }
    }

    return null // Fallback if no selection or data found
  }

  let tempId = 0;

  const addNewFund = () => {
    const newFund = {
      id: `temp-${tempId++}`, // Assign a temporary unique ID
      name: "",
      byline: "",
      street: "",
      city_state_zip: ""
    };
    setFundData([...fundData, newFund]);
    setSelectedFund(newFund); // Select the new fund to display the form
  };
  
  const addNewCompany = () => {
    const newCompany = {
      id: `temp-${tempId++}`, // Assign a temporary unique ID
      name: "",
      state_of_incorporation: "",
      street: "",
      city_state_zip: ""
    };
    setCompanyData([...companyData, newCompany]);
    setSelectedCompany(newCompany); // Select the new company to display the form
  };

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
            {renderFundsOrCompanies(form.watch("type"))}
            {selectedFund || selectedCompany
              ? renderAdditionalFields(form.watch("type"))
              : null}
            <div className="flex flex-col gap-2">
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
