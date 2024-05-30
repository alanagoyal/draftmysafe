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

export const runtime = 'edge'

export async function POST(req: Request, res: NextResponse) {
  try {
    let ctrl: ReadableStreamDefaultController | undefined
    
    const stream = new ReadableStream({
      start(controller) {
        ctrl = controller
      }
    })
    
    new Promise<void>(async (resolve) => {
      try {
        
        const content = await req.json()

        const prompt = await loadPrompt({
          projectName: "draftmysafe",
          slug: "summarize",
        })
        console.log("Loaded prompt:", prompt); // Log the loaded prompt

        const completion = await traced(
          async (span) => {
            console.log("Creating completion with content:", content); // Log before creating completion
            const response = await openai.chat.completions.create(
              prompt.build({
                question: content,
                apiKey: process.env.BRAINTRUST_API_KEY,
              })
            )
            console.log("Received response from OpenAI:", response); // Log the response from OpenAI
            
            const output = response.choices[0].message.content
            span.log({ input: content, output })
            console.log("Output generated:", output); // Log the generated output
            return output
          },
          { name: "generate-summary", event: content }
        )
        
        ctrl?.enqueue(JSON.stringify({ summary: completion }))
        console.log("Enqueued completion"); // Log after enqueuing the completion
        ctrl?.close()
        console.log("Stream closed"); // Log when stream is closed
        resolve()
      } catch (err) {
        console.error(`Failed to generate completion`, err);
        console.log("Error in generating completion:", err); // Log detailed error
      }
    })

    return new Response(stream, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error(error)
    console.log("Error in POST function:", error); // Log error in POST function
    return NextResponse.json({ error })
  }
}