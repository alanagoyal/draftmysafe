import type { Metadata } from "next";
import "@/styles/globals.css";
import { siteConfig } from "@/config/site"
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import SiteFooter from "@/components/site-footer";
import { CommandMenu } from "@/components/command-menu";
import { createClient } from "@/utils/supabase/server";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
        <meta property="og:description" content={siteConfig.description}></meta>
        <meta
          property="og:image"
          content={`${siteConfig.url}/opengraph-image`}
        />
        <meta property="og:url" content={siteConfig.url}></meta>
        <meta
          property="og:image"
          content={`${siteConfig.url}/opengraph-image`}
        />
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
              <SiteHeader user={user} />
              <CommandMenu />
              <main className="flex-1">
                <div className="flex flex-col items-center pt-10 py-2 max-w-5xl mx-auto">
                  {children}
                </div>
              </main>
              <SiteFooter />
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}