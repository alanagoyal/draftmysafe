import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Home() {
  const sections = [
    {
      title: "Pre-Fill & Generate in Minutes",
      subtitle:
        "Save time with our streamlined YC SAFE creation process. Create your account, store your signature block, and effortlessly pre-fill future agreements. Focus more on your investments and less on paperwork.",
    },
    {
      title: "Securely Request Founder Details",
      subtitle:
        "Send a secure link to founders to gather necessary information for the SAFE agreement. Our platform ensures data security and simplicity, making the process smooth for both you and the founders.",
    },
    {
      title: "Secure E-Signatures Made Easy",
      subtitle:
        "Finalize your agreements with ease using our integrated e-signature feature. Send out documents for signing securely and keep everything organized within our app, ensuring a professional and efficient investment process.",
    },
  ]

  return (
    <div className="w-full pt-10 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-[980px] flex-col items-start gap-2">
          <div className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
            Draftmysafe
          </div>
          <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl pt-2">
            Skip the paperwork & generate a YC SAFE agreement in minutes
          </p>
        </div>
        <div className="flex py-4">
          <Link href="/new">
            <Button>Get Started</Button>
          </Link>
        </div>
        <div className="flex flex-col md:flex-row justify-around items-stretch my-20">
          {sections.map((section, index) => (
            <Card
              key={index}
              className={`flex flex-col w-full md:w-1/3 shadow-lg rounded-lg ${
                index === 1 ? "md:mx-4 my-2 md:my-0" : "my-4 md:my-0"
              }`}
            >
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{section.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
