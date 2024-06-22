import { NextResponse, type NextRequest } from "next/server"
import { fileToBase64 } from "@/utils/fileService"

import {
  addDocToTemplate,
  createEnvelope,
  createTemplate,
  sendEnvelope,
} from "@/lib/apis"
import { ACCOUNT_ID, BASE64 } from "@/lib/constants"

export async function POST(request: NextRequest) {
  const Signer = {
    email: "dipuchaurasiya91@gmail.com",
    name: "Dipu Chaurasiya",
  }

  try {
    const res = await createTemplate(ACCOUNT_ID)
    const templateId = res.templateId
    // const convertFileToBase64 = await fileToBase64(
    //   "SafeValuedocs.docx",
    //   "/SAFE-Valuation-Cap.docx"
    // )
    const addDocToTemplateRes = await addDocToTemplate(
      BASE64,
      ACCOUNT_ID,
      templateId,
      1
    )
    const envelopId = await createEnvelope(
      ACCOUNT_ID,
      templateId,
      Signer.email,
      Signer.name
    )
    await sendEnvelope(ACCOUNT_ID, envelopId.envelopeId)
    return NextResponse.json({
      message: "POST request successful",
      tempateRes: res || {},
      addDocToTemplateRes: addDocToTemplateRes || {},
      envelopId: envelopId || {},
    })
  } catch (error) {
    console.error("POST request failed", error)
    return NextResponse.json({ message: "POST request failed", error })
  }
}
