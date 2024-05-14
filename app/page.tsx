import Link from "next/link"

import { Button } from "@/components/ui/button"

export default async function IndexPage() {

  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="container mx-auto my-48 flex-grow">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <div className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
              Draftmysafe
            </div>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
              Skip the paperwork & generate a YC SAFE agreement in minutes
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/new">
              <Button className=" text-white px-8 py-4 rounded-md text-base">
                Get Started
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
