import { BraintrustAdapter } from "@braintrust/vercel-ai-sdk"
import { initLogger, invoke, wrapTraced } from "braintrust"

initLogger({
  projectName: "eventbase",
  apiKey: process.env.BRAINTRUST_API_KEY,
  asyncFlush: true,
})

export async function POST(req: Request) {
  const {
    company_name,
    investing_entity_name,
    investment_type,
    purchase_amount,
    valuation_cap,
    discount,
    date,
    side_letter,
    info_rights,
    pro_rata_rights,
    major_investor_rights,
    termination,
  } = await req.json()
  const summary = await handleRequest(
    company_name,
    investing_entity_name,
    investment_type,
    purchase_amount,
    valuation_cap,
    discount,
    date,
    side_letter,
    info_rights,
    pro_rata_rights,
    major_investor_rights,
    termination
  )
  return BraintrustAdapter.toAIStreamResponse(summary)
}

const handleRequest = wrapTraced(async function handleRequest(
  company_name: string,
  investing_entity_name: string,
  investment_type: string,
  purchase_amount: string,
  valuation_cap: string,
  discount: string,
  date: string,
  side_letter: string,
  info_rights: boolean,
  pro_rata_rights: boolean,
  major_investor_rights: boolean,
  termination: boolean
) {
  return await invoke({
    project_name: "draftmysafe",
    slug: "summarize-api",
    input: {
      company_name,
      investing_entity_name,
      investment_type,
      purchase_amount,
      valuation_cap,
      discount,
      date,
      side_letter,
      info_rights,
      pro_rata_rights,
      major_investor_rights,
      termination,
    },
    stream: true,
  })
})

// Allow streaming responses up to 30 seconds
export const maxDuration = 30
