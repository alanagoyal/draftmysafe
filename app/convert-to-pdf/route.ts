import { Readable } from "stream"

async function streamToBuffer(readableStream: Readable) {
  const chunks = []
  for await (const chunk of readableStream) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export async function POST(req: any) {
  console.log("in convert-to-pdf route")
  try {
    const input = await streamToBuffer(req.body)
    const inputFile = new File([input], "input.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })

    const data = new FormData()
    data.append(
      "options",
      new File([JSON.stringify({})], "options.json", {
        type: "application/json",
      })
    )
    data.append("file", inputFile)

    const apiResponse = await fetch(
      "https://api.staging.fileforge.com/pdf/docx/",
      {
        method: "POST",
        headers: {
          accept: "application/pdf",
          "X-API-Key": process.env.ONEDOC_API_KEY!,
        },
        body: data as any,
      }
    )

    console.log(apiResponse.body)
    if (!apiResponse.ok) {
      throw new Error(`API error with status: ${apiResponse.status}`)
    }

    const arrayBuffer = await apiResponse.arrayBuffer()
    const pdfBuffer = Buffer.from(arrayBuffer)
    return new Response(pdfBuffer, {
      status: 200,
      headers: { "Content-Type": "application/pdf" },
    })
  } catch (error) {
    console.error("Error in PDF conversion:", error)
    return new Response("Error converting file to PDF", { status: 500 })
  }
}
