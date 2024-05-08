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
  email: z.string().email(),
  name: z.string().optional(),
  title: z.string().optional(),
  type: z.enum(["fund", "company"]).optional(),
  entity_name: z.string().optional(),
  byline: z.string().optional(),
  street: z.string().optional(),
  city_state_zip: z.string().optional(),
  state_of_incorporation: z.string().optional(),
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
  const [entities, setEntities] = useState<any[]>([])
  const [selectedEntity, setSelectedEntity] = useState<string>("")

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: userData.email || "",
      name: userData.name || "",
      title: userData.title || "",
      type: "fund",
      entity_name: "",
      byline: "",
      street: "",
      city_state_zip: "",
      state_of_incorporation: "",
    },
  })

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
      setEntities([...fundData, ...companyData])
    } else {
      console.error(fundError || companyError)
    }
  }

  function handleSelectChange(value: string) {
    setSelectedEntity(value)
    if (value === "add-new") {
      form.reset({
        ...form.getValues(),
        type: "fund", // default type
        entity_name: "",
        byline: "",
        street: "",
        city_state_zip: "",
        state_of_incorporation: "",
      })
    }
  }

  function renderEntities() {
    return (
      <div className="space-y-2">
        <FormLabel>Entities</FormLabel>
        <Select
          key={`select-${entities.length}`}
          value={selectedEntity}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select or add an entity" />
          </SelectTrigger>
          <SelectContent>
            {entities.map((item, index) => (
              <SelectItem key={`${item.id}`} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
            <SelectItem key="add-new" value="add-new">
              + Add New Entity
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  function renderAdditionalFields() {
    if (selectedEntity === "add-new") {
      return (
        <>
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Entity Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="fund" />
                      </FormControl>
                      <FormLabel className="font-normal">Fund</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="company" />
                      </FormControl>
                      <FormLabel className="font-normal">Company</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormDescription>
                  Please indicate the entity type
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="entity_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entity Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  {form.watch("type") === "fund"
                    ? formDescriptions.fundName
                    : formDescriptions.companyName}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch("type") === "fund" && (
            <FormField
              control={form.control}
              name="byline"
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
          )}
          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  {form.watch("type") === "fund"
                    ? formDescriptions.fundStreet
                    : formDescriptions.companyStreet}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city_state_zip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City, State, Zip Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  {form.watch("type") === "fund"
                    ? formDescriptions.fundCityStateZip
                    : formDescriptions.companyCityStateZip}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch("type") === "company" && (
            <FormField
              control={form.control}
              name="state_of_incorporation"
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
          )}
        </>
      )
    }
    return null
  }

  async function onSubmit(data: AccountFormValues) {
    try {
      // Update account
      const accountUpdates = {
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
          <div className="space-y-4">
            {renderEntities()}
            {renderAdditionalFields()}
            <Button className="w-full" type="submit">
              Update
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
