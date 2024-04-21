import type { Metadata } from "next"

import "@/styles/globals.css"
import { Inter } from "next/font/google"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      <title>{siteConfig.name}</title> 
        <meta property="twitter:card" content="summary_large_image"></meta>
        <meta
          property="twitter:description"
          content={siteConfig.description}
        ></meta>
        <meta
          property="twitter:image"
          content={`${siteConfig.url}/opengraph-image`}
        ></meta>
        <meta property="og:title" content={siteConfig.name}></meta>
        <meta
          property="og:description"
          content={siteConfig.description}
        ></meta>
        <meta
          property="og:image"
          content={`${siteConfig.url}/opengraph-image`}
        />
        <meta property="og:url" content={siteConfig.url}></meta>
        <meta property="og:image" content={`${siteConfig.url}/opengraph-image`} />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div vaul-drawer-wrapper="">
            <div className="relative flex flex-col bg-background">
              <SiteHeader />
              <main className="flex-1">
                <div className="flex flex-col items-center pt-10 py-2 max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
