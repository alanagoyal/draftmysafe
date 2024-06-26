import axios, { axiosInstance } from "@/config/axios"

const BASE_URL = process.env.AMP_BASE_URL
const E_SIGN_URL = process.env.E_SIGN_URL

if (!BASE_URL || !E_SIGN_URL) {
  throw new Error("AMP_BASE_URL and E_SIGN_URL must be set in the environment")
}

export const createTemplate = async (accountId: string) => {
  const data = {
    name: "Template Name",
    description: "Template Description",
    emailSubject: "Email Subject",
    shared: false,
    status: "created",
    recipients: {
      signers: [
        {
          recipientId: "1",
          roleName: "signer",
          routingOrder: "1",
        },
      ],
    },
  }
  const response = await axiosInstance().post(
    `${BASE_URL}/${E_SIGN_URL}/accounts/${accountId}/templates`,

    data
  )

  return response.data
}

export const addDocToTemplate = async (
  safeAttachmentBase64: any,
  sideLetterAttachmentBase64: any,
  accountId: string,
  templateId: string,
  FirstDocumentId: number,
  secondDocumentId: number
) => {
  let documents1 = []
  let documents2 = []
  if (safeAttachmentBase64) {
    documents1.push({
      documentBase64: safeAttachmentBase64,
      documentId: FirstDocumentId,
      name: "SafeValuation.docx",
      fileExtension: "docx",
      order: 1,
      pages: 1,
    })
  }

  if (sideLetterAttachmentBase64) {
    documents2.push({
      documentBase64: sideLetterAttachmentBase64,
      documentId: secondDocumentId,
      name: "SideLetter.docx",
      fileExtension: "docx",
      order: 2,
      pages: 1,
    })
  }

  const res = await axiosInstance().put(
    `${BASE_URL}/${E_SIGN_URL}/accounts/${accountId}/templates/${templateId}/documents/${FirstDocumentId}`,
    { documents: documents1 }
  )
  if (documents2.length === 0) return res.data

  await axiosInstance().put(
    `${BASE_URL}/${E_SIGN_URL}/accounts/${accountId}/templates/${templateId}/documents/${secondDocumentId}`,
    { documents: documents2 }
  )

  return res.data
}

export const createEnvelope = async (
  accountId: string,
  templateId: string,
  Signers: Signer[]
) => {
  const data = {
    templateId: templateId,
    templateRoles: Signers,
    status: "created",
  }

  const res = await axiosInstance().post(
    `${BASE_URL}/${E_SIGN_URL}/accounts/${accountId}/envelopes`,
    data
  )
  return res.data
}

export const sendEnvelope = async (accountId: string, envelopeId: string) => {
  const data = {
    status: "sent",
  }

  const res = await axiosInstance().put(
    `${BASE_URL}/${E_SIGN_URL}/accounts/${accountId}/envelopes/${envelopeId}`,
    data
  )
  return res.data
}

export const addTabsToTemplate = async (
  accountId: string,
  templateId: string,
  anchorData: IanchorData[]
) => {
  const reqData = {
    signHereTabs: anchorData,
  }

  const res = await axiosInstance().post(
    `${BASE_URL}/${E_SIGN_URL}/accounts/${accountId}/templates/${templateId}/recipients/1/tabs`,
    reqData
  )
  return res.data
}
