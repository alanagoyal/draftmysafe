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

  const customerQuotes = [
    {
      avatar: "guillermo.jpeg",
      name: "Guillermo Rauch",
      companyUrl: "https://vercel.com",
      companyName: "Vercel",
      role: "Founder",
      quote: (
        <div className="flex flex-row items-stretch">
          <div className="flex w-full sm:w-2/3 items-center justify-center">
            &quot;I used @alanaagoyal&apos;s AI-based brand generation tool and
            it&apos;s shockingly good.
            <br />
            <br />
            It coined &apos;brainy&apos; and generated this cool logo in a
            couple seconds 😁. Quite the head-start to get your idea into the
            world.&quot;
          </div>
          <div
            className="flex sm:w-1/3 items-center justify-center mx-4 hidden sm:flex"
            style={{ marginTop: "-20px" }}
          >
            <img
              src="brainy.png"
              alt="Brainy"
              className="object-cover w-40 h-40 rounded-md"
            />
          </div>
        </div>
      ),
    },
    {
      avatar: "paul.jpeg",
      name: "Paul Dornier",
      companyUrl: "https://alpharun.com",
      companyName: "Alpharun",
      role: "Co-Founder",
      quote: (
        <>
          &quot;When we started our company we knew we needed a simple,
          memorable name that built trust with our customers. Before Branded, we
          spent hours coming up with names and looking up domain availability.
          With Branded we found alpharun.com with a click, and haven&apos;t
          looked back since.
          <br />
          <br />
          The process was seamless, and the results were beyond my expectations.
          Highly recommend!&quot;
        </>
      ),
    },
    {
      avatar: "jordan.jpeg",
      name: "Jordan Singer",
      companyUrl: "https://figma.com",
      companyName: "Figma",
      role: "Product Designer",
      quote: (
        <>
          &quot;I love how Alana builds tools that not only her portfolio
          companies but anyone can use. Branded is a great example of a simple
          idea to help come up with one of the most critical parts of your
          company: its name.
          <br />
          <br />
          Namestorming with AI gives you lots of interesting ideas, and you can
          make a logo and get your domain too!&quot;
        </>
      ),
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
        {/*       <div className="my-20 flex justify-center w-full">
          <Carousel className="w-4/5 justify-center">
            <CarouselContent>
              {customerQuotes.map((customerQuote, index) => (
                <CarouselItem key={index}>
                  <Card className="p-4 shadow-lg rounded-lg">
                    <CardContent>
                      <a
                        href={customerQuote.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center"
                      >
                        <img
                          src={customerQuote.avatar}
                          alt="Customer avatar"
                          className="w-16 h-16 rounded-full mr-4"
                        />
                        <div className="flex flex-col">
                          <h3 className="text-xl font-bold">
                            {customerQuote.name}
                          </h3>
                          <p className="text-sm">
                            {customerQuote.role}, {customerQuote.companyName}
                          </p>
                        </div>
                      </a>
                      <div className="mt-4 text-sm">{customerQuote.quote}</div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div> */}
      </div>
    </div>
  )
}
