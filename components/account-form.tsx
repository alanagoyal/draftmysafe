"use client"

import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { toast } from "./ui/use-toast"

const accountFormSchema = z.object({
  type: z.enum(["founder", "investor", "both"], {
    required_error: "You need to select a signatory type.",
  }),
  email: z.string().email(),
  name: z.string().min(2),
  title: z.string().min(2),
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
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      type: userData.type || "",
      email: userData.email || "",
      name: userData.name || "",
      title: userData.title || "",
    },
  })

  async function onSubmit(data: AccountFormValues) {
    try {
      const updates = {
        type: data.type,
        email: userData.email,
        name: data.name,
        title: data.title,
        updated_at: new Date(),
      }

      let { error } = await supabase
        .from("users")
        .update(updates)
        .eq("auth_id", user.id)
      if (error) throw error
      toast({
        description: "Account updated",
      })
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        description: "Error updating account",
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
