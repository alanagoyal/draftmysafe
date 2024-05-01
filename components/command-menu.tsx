"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { LogOut, Moon, Plus, Sun, User } from "lucide-react"
import { useTheme } from "next-themes"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./ui/command"

export function CommandMenu() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const navigateAndCloseDialog = (path: string) => {
    router.push(path)
    setOpen(false)
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }

      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case "g":
            e.preventDefault()
            navigateAndCloseDialog("/new")
            break
          case "a":
            e.preventDefault()
            navigateAndCloseDialog("/account")
            break
          case "f":
            e.preventDefault()
            navigateAndCloseDialog("/favorites")
            break
          case "s":
            e.preventDefault()
            navigateAndCloseDialog("/help")
            break
          case "o":
            e.preventDefault()
            handleSignOut()
            break
          case "d":
            e.preventDefault()
            setTheme(theme === "light" ? "dark" : "light")
            break
          default:
            break
        }
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [router, theme, setTheme])

  const handleSignOut = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const CommandLinkItem = ({
    href,
    newTab,
    onClick,
    children,
  }: {
    href?: string
    newTab?: boolean
    onClick?: () => void
    children: React.ReactNode
  }) => {
    if (href) {
      return (
        <Link
          href={href}
          target={newTab ? "_blank" : undefined}
          onClick={() => setOpen(false)}
        >
          {children}
        </Link>
      )
    } else {
      return (
        <div
          onClick={() => {
            onClick?.()
            setOpen(false)
          }}
        >
          {children}
        </div>
      )
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          <CommandLinkItem href="/new">
            <CommandItem>
              <Plus className="mr-2 h-4 w-4" />
              <span>Generate</span>
              <CommandShortcut>⌘G</CommandShortcut>
            </CommandItem>
          </CommandLinkItem>
          <CommandLinkItem href="/account">
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Account</span>
              <CommandShortcut>⌘A</CommandShortcut>
            </CommandItem>
          </CommandLinkItem>
          <CommandSeparator />
          <CommandLinkItem
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <CommandItem>
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              <span>Switch Theme</span>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
          </CommandLinkItem>
          <CommandSeparator />
          <CommandItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
            <CommandShortcut>⌘O</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
