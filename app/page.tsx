import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Home() {
  const sections = [
    {
      title: "Signature Blocks",
      subtitle:
        "Save time with our streamlined YC SAFE creation process. Create your account, store your signature block, and effortlessly pre-fill future agreements. Focus more on your investments and less on paperwork.",
    },
    {
      title: "Secure Sharing",
      subtitle:
        "Send a secure link to founders to gather necessary information for the SAFE agreement. Our platform ensures data security and simplicity, making the process smooth for both you and the founders.",
    },
    {
      title: "Easy E-Signatures",
      subtitle:
        "Finalize your agreements with ease using our integrated e-signature feature. Send out documents for signing securely and keep everything organized within our app, ensuring a professional and efficient investment process.",
    },
  ]

  return (
    <div className="w-full pt-10 min-h-screen flex flex-col items-center">
      <div className="text-center w-full pt-20 flex flex-col justify-center items-center">
        <div className="text-5xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
          Draftmysafe
        </div>
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl pt-4">
          Skip the paperwork & generate a YC SAFE agreement in minutes
        </p>
        <div className="py-4">
          <Link href="/new">
            <Button className="w-48">Get Started</Button>
          </Link>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-stretch pt-10 w-full">
        {sections.map((section, index) => (
          <Card
            key={index}
            className={`flex flex-col w-full md:w-1/3 shadow-lg rounded-lg mx-2 my-4`}
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
  )
}
