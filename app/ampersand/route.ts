import { NextResponse, type NextRequest } from "next/server"

import {
  addDocToTemplate,
  createEnvelope,
  createTemplate,
  sendEnvelope,
} from "@/lib/apis"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      investmentData,
      safeAttachment,
      sideLetterAttachment,
      emailContent,
    } = body

    const ACCOUNT_ID = process.env.DOCUSIGN_ACCOUNT_ID

    if (!investmentData || !safeAttachment) {
      return NextResponse.json(
        {
          message: "investmentData or SafeAttachment not found",
        },
        {
          status: 400,
        }
      )
    }

    if (!ACCOUNT_ID) {
      return NextResponse.json({ message: "ACCOUNT_ID not found" })
    }

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
    let sideLetterAttachmentBASE64 = null
    if (sideLetterAttachment) {
      const sideLetterAttachmentArraybuffer = sideLetterAttachment?.data
      const sideLetterAttachmentbuffer = Buffer.from(
        sideLetterAttachmentArraybuffer
      )
      sideLetterAttachmentBASE64 = sideLetterAttachmentbuffer.toString("base64")
    }

    const template = await createTemplate(ACCOUNT_ID)

    if (!template?.sucess) {
      return NextResponse.json(
        {
          error: "Error creating template",
          message: template.message,
        },
        {
          status: 400,
        }
      )
    }

    const templateId = template.data.templateId
    const addDocToTemplateRes = await addDocToTemplate(
      safeAttachmentBASE64,
      sideLetterAttachmentBASE64,
      ACCOUNT_ID,
      templateId,
      1,
      2
    )

    if (!addDocToTemplateRes?.sucess) {
      return NextResponse.json(
        {
          error: "Error adding document to template",
          message:
            addDocToTemplateRes.message || "Add document to template failed",
        },
        {
          status: 400,
        }
      )
    }

    const envelope = await createEnvelope(ACCOUNT_ID, templateId, Signers)

    if (!envelope?.sucess) {
      return NextResponse.json(
        {
          error: "Error creating envelope",
          message: envelope.message,
        },
        {
          status: 400,
        }
      )
    }

    const envelopeId = envelope?.data?.envelopeId
    const sendEnvelopeResponse = await sendEnvelope(ACCOUNT_ID, envelopeId)

    if (!sendEnvelopeResponse?.sucess) {
      return NextResponse.json(
        {
          error: "Error sending envelope",
          message: sendEnvelopeResponse.message,
        },
        {
          status: 400,
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Document sent successfully",
      // tempateRes: template.data || {},
      // addDocToTemplateRes: addDocToTemplateRes.data || {},
      // envelopId: envelopeId || {},
      // sendEnvelopeResponse: sendEnvelopeResponse.data || {},
    })
  } catch (error) {
    return NextResponse.json(
      {
        message: "POST request failed",
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    )
  }
}
