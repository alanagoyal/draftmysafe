import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"

export default async function Home() {
  const sections = [
    {
      title: "Document Creation",
      subtitle:
        "Save time with our streamlined YC SAFE creation process. Create your account, store your signature block, and effortlessly pre-fill future agreements. Focus more on your investments and less on paperwork.",
      icon: Icons.files,
    },
    {
      title: "Secure Sharing",
      subtitle:
        "Send a secure link to founders to gather necessary information for the SAFE agreement. Our platform ensures data security and simplicity, making the process smooth for both you and the founders.",
      icon: Icons.lock,
    },
    {
      title: "Easy E-Signatures",
      subtitle:
        "Finalize your agreements with ease using our integrated e-signature feature. Send out documents for signing securely and keep everything organized within our app, ensuring a professional and efficient investment process.",
      icon: Icons.signature,
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
            <Button className="w-48 h-12 rounded-full">Get Started</Button>
          </Link>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-stretch pt-8 w-full">
        {sections.map((section, index) => (
          <Card
            key={index}
            className={`flex flex-col w-full md:w-1/3 shadow-lg rounded-lg mx-2 my-4`}
          >
            <CardHeader>
              <div className="flex flex-col items-center">
                <section.icon className="w-12 h-12 my-2" />
                <CardTitle>{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-center">{section.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}