"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@radix-ui/react-label"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { formDescriptions } from "@/lib/utils"

import AuthRefresh from "./auth-refresh"
import { EntitySelector } from "./entity-selector"
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
import { Textarea } from "./ui/textarea"
import { ToastAction } from "./ui/toast"
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
  const router = useRouter()
  const supabase = createClient()
  const [entities, setEntities] = useState<any[]>([])
  const [selectedEntity, setSelectedEntity] = useState<string>("")
  const [showAdditionalFields, setShowAdditionalFields] = useState(false)

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
      const typedFundData = fundData.map((fund) => ({ ...fund, type: "fund" }))
      const typedCompanyData = companyData.map((company) => ({
        ...company,
        type: "company",
      }))
      setEntities([...typedFundData, ...typedCompanyData])

      if (typedFundData.length === 0 && typedCompanyData.length === 0) {
        setSelectedEntity("add-new")
      } else {
        setSelectedEntity(typedFundData[0]?.id || typedCompanyData[0]?.id)
      }
    } else {
      console.error(fundError || companyError)
      setSelectedEntity("add-new")
    }
  }

  async function onSubmit(data: AccountFormValues) {
    try {
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

      if (
        data.entity_name ||
        data.byline ||
        data.street ||
        data.city_state_zip ||
        data.state_of_incorporation
      ) {
        if (data.type === "fund") {
          await processFund(data)
        } else if (data.type === "company") {
          await processCompany(data)
        }
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
      setShowAdditionalFields(false)
    }
  }

  async function processFund(data: AccountFormValues) {
    const fundUpdates = {
      name: data.entity_name,
      byline: data.byline,
      street: data.street,
      city_state_zip: data.city_state_zip,
      investor_id: userData.id,
    }

    const { data: existingFund, error: existingFundError } = await supabase
      .from("funds")
      .select()
      .eq("investor_id", userData.id)
      .eq("name", data.entity_name)

    if (existingFund && existingFund.length > 0) {
      const { error: updateError } = await supabase
        .from("funds")
        .update(fundUpdates)
        .eq("id", existingFund[0].id)

      if (updateError) {
        console.error("Error updating fund:", updateError)
        toast({
          variant: "destructive",
          description: "Error updating fund",
        })
      }
    } else {
      const { data: newFund, error: newFundError } = await supabase
        .from("funds")
        .insert(fundUpdates)
        .select()

      if (newFundError) {
        console.error("Error creating fund:", newFundError)
        toast({
          variant: "destructive",
          description: "Error creating fund",
        })
      } else {
        setEntities((prevEntities) => [
          ...prevEntities,
          { ...fundUpdates, id: newFund[0].id, type: "fund" },
        ])
        setSelectedEntity(newFund[0].id)
      }
    }
  }

  async function processCompany(data: AccountFormValues) {
    const companyUpdates = {
      name: data.entity_name,
      street: data.street,
      city_state_zip: data.city_state_zip,
      state_of_incorporation: data.state_of_incorporation,
      founder_id: userData.id,
    }

    // Check if company already exists
    const { data: existingCompany, error: existingCompanyError } =
      await supabase
        .from("companies")
        .select()
        .eq("founder_id", userData.id)
        .eq("name", data.entity_name)

    if (existingCompany && existingCompany.length > 0) {
      // Update the existing company
      const { error: updateError } = await supabase
        .from("companies")
        .update(companyUpdates)
        .eq("id", existingCompany[0].id)

      if (updateError) {
        console.error("Error updating company:", updateError)
        toast({
          variant: "destructive",
          description: "Error updating company",
        })
      }
    } else {
      // Create a new company
      const { data: newCompany, error: newCompanyError } = await supabase
        .from("companies")
        .insert(companyUpdates)
        .select()

      if (newCompanyError) {
        console.error("Error creating company:", newCompanyError)
        toast({
          variant: "destructive",
          description: "Error creating company",
        })
      } else {
        setEntities((prevEntities) => [
          ...prevEntities,
          { ...companyUpdates, id: newCompany[0].id, type: "company" },
        ])
        setSelectedEntity(newCompany[0].id)
      }
    }
  }

  async function deleteEntity() {
    if (selectedEntity === "add-new-fund" || selectedEntity === "add-new-company") {
      toast({
        description: `${selectedEntity === "add-new-fund" ? "New fund" : "New company"} discarded`,
      });
      setSelectedEntity(entities.length > 0 ? entities[0].id : "add-new");
      setShowAdditionalFields(false);
      return;
    }
  
    const selectedEntityDetails = entities.find(entity => entity.id === selectedEntity);
    if (!selectedEntityDetails) return;
  
    const entityType = selectedEntityDetails.type;
    const tableName = entityType === "fund" ? "funds" : "companies";
  
    try {
      const { error } = await supabase.from(tableName).delete().eq("id", selectedEntity);
  
      if (error) {
        if (error.code === "23503") {
          toast({
            title: `Unable to delete ${entityType}`,
            description: `This ${entityType} is currently associated with an active investment.`,
            action: (
              <ToastAction
                onClick={() => router.push("/investments")}
                altText="Investments"
              >
                Investments
              </ToastAction>
            ),
          });
        } else {
          toast({
            variant: "destructive",
            description: `Failed to delete the ${entityType}`,
          });
          console.error(`Error deleting ${entityType}:`, error);
        }
      } else {
        toast({
          description: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} deleted`,
        });
        setEntities(entities.filter(entity => entity.id !== selectedEntity));
        setSelectedEntity(entities.length > 0 ? entities[0].id : "add-new");
        setShowAdditionalFields(false);
      }
    } catch (error) {
      console.error(`Error processing deletion of ${entityType}:`, error);
      toast({
        variant: "destructive",
        description: `An error occurred while deleting the ${entityType}`,
      });
    }
  }

  function handleSelectChange(value: string) {
    setSelectedEntity(value)
    setShowAdditionalFields(true)

    if (value === "add-new-fund" || value === "add-new-company") {
      form.reset({
        ...form.getValues(),
        type: value === "add-new-fund" ? "fund" : "company",
        entity_name: "",
        byline: "",
        street: "",
        city_state_zip: "",
        state_of_incorporation: "",
      })
    } else {
      // Fetch the selected entity's details and set them in the form
      const selectedEntityDetails = entities.find(
        (entity) => entity.id === value
      )
      if (selectedEntityDetails) {
        form.reset({
          ...form.getValues(),
          type: selectedEntityDetails.type,
          entity_name: selectedEntityDetails.name,
          byline: selectedEntityDetails.byline,
          street: selectedEntityDetails.street,
          city_state_zip: selectedEntityDetails.city_state_zip,
          state_of_incorporation: selectedEntityDetails.state_of_incorporation,
        })
      }
    }
  }

  function renderAdditionalFields() {
    if (showAdditionalFields) {
      return (
        <>
          <div className="flex items-center justify-between space-x-2">
            <div className="w-full">
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
            </div>
            <Icons.trash
              className="cursor-pointer"
              onClick={() => deleteEntity()}
            />
          </div>
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

  return (
    <div className="flex flex-col items-center min-h-screen py-2 w-2/3">
      <AuthRefresh />
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <div className="pt-4">
            <Label className="text-md font-bold">Personal Information</Label>
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
                  This is the name that will be used in your signature block
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
            <div className="space-y-2">
              <div className="pt-4 pb-2">
                <Label className="text-md font-bold">Entity Information</Label>
              </div>
              <FormLabel>Signature Blocks</FormLabel>
              <EntitySelector
                entities={entities}
                selectedEntity={selectedEntity}
                onSelectChange={handleSelectChange}
                entityType="both"
              />
            </div>
            {renderAdditionalFields()}
            <Button className="w-full" type="submit">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
