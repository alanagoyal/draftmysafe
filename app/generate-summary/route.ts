import { NextResponse } from "next/server"
import { initLogger, loadPrompt, traced, wrapOpenAI } from "braintrust"
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
    const content = await req.json()

    const prompt = await loadPrompt({
      projectName: "draftmysafe",
      slug: "summarize",
    })

    const completion = await traced(
      async (span) => {
        const response = await openai.chat.completions.create(
          prompt.build({
            question: content,
          })
        )
        
        const output = response.choices[0].message.content
        span.log({ input: content, output })
        return output
      },
      { name: "generate-summary", event: content }
    )

    return new Response(JSON.stringify({ summary: completion }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error })
  }
}
