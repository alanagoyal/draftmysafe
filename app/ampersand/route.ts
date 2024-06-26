import { NextResponse, type NextRequest } from "next/server"

import {
  addDocToTemplate,
  createEnvelope,
  createTemplate,
  sendEnvelope,
} from "@/lib/apis"
import { ACCOUNT_ID } from "@/lib/constants"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { investmentData, safeAttachment, sideLetterAttachment, emailContent } =
    body

  const Signers: any = []
  if (safeAttachment || sideLetterAttachment) {
    Signers.push({
      email: investmentData.founder.email,
      name: investmentData.founder.name,
      roleName: "signer",
      recipientId: 1,
      tabs: {
        signHereTabs: [
          {
            anchorString: "\\s1\\",
            anchorXOffset: 70,
            anchorYOffset: -5,
            anchorUnits: "pixels",
            anchorIgnoreIfNotPresent: true,
          },
        ],
      },
    })
    Signers.push({
      email: investmentData.investor.email,
      name: investmentData.investor.name,
      roleName: "signer",
      recipientId: 2,
      tabs: {
        signHereTabs: [
          {
            anchorString: "\\s2\\",
            anchorXOffset: 70,
            anchorYOffset: -5,
            anchorUnits: "pixels",
            anchorIgnoreIfNotPresent: true,
          },
        ],
      },
    })
  }

  // Convert the ArrayBuffer of SafetAttachement to a base64 string
  const safeAttachmentArraybuffer = safeAttachment.data
  const safeAttachmentbuffer = Buffer.from(safeAttachmentArraybuffer)
  const safeAttachmentBASE64 = safeAttachmentbuffer.toString("base64")

  // Convert the ArrayBuffer of SafetAttachement to a base64 string
  const sideLetterAttachmentArraybuffer = sideLetterAttachment.data
  const sideLetterAttachmentbuffer = Buffer.from(
    sideLetterAttachmentArraybuffer
  )
  const sideLetterAttachmentBASE64 =
    sideLetterAttachmentbuffer.toString("base64")

  try {
    const res = await createTemplate(ACCOUNT_ID)
    const templateId = res.templateId
    // const convertFileToBase64 = await fileToBase64(
    //   "SafeValuedocs.docx",
    //   "/SAFE-Valuation-Cap.docx"
    // )
    const addDocToTemplateRes = await addDocToTemplate(
      safeAttachmentBASE64,
      sideLetterAttachmentBASE64,
      ACCOUNT_ID,
      templateId,
      1,
      2
    )
    const envelopId = await createEnvelope(ACCOUNT_ID, templateId, Signers)
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
