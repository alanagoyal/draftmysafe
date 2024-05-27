import { NextResponse } from "next/server"
import { initLogger, traced, wrapOpenAI, loadPrompt } from "braintrust"
import { OpenAI } from "openai"

const logger = initLogger({
  apiKey: process.env.BRAINTRUST_API_KEY,
  projectName: "draftmysafe",
})

const openai = wrapOpenAI(
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://braintrustproxy.com/v1",
  })
)

export async function POST(req: Request, res: NextResponse) {
  try {
    const body = await req.json()

    const prompt = await loadPrompt({
        projectName: "draftmysafe",
        slug: "summary",
    })

    const completion = await traced(
      async (span) => {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a legal assistant for a venture capital firm. You are given a document and you need to summarize it. Please summarize the document in a few sentences.",
            },
            {
              role: "user",
              content: body["content"],
            },
          ],
        })
        console.log(response)
        const output = response.choices[0].message.content
        span.log({ input: body, output })
        return output
      },
      { name: "generate-summary", event: body }
    )

    return new Response(completion, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return NextResponse.json({ error })
  }
}
