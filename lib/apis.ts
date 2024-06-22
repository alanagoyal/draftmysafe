import axios, { axiosInstance } from "@/config/axios"

import { BASE_URL, E_SIGN_URL } from "./constants"

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
  base64file: any,
  accountId: string,
  templateId: string,
  documentId: number
) => {
  const data = {
    documents: [
      {
        documentBase64: base64file,
        documentId: documentId,
        name: "SafeValuation.docx",
        fileExtension: "docx",
        order: 1,
        pages: 1,
      },
    ],
  }

  const res = await axiosInstance().put(
    `${BASE_URL}/${E_SIGN_URL}/accounts/${accountId}/templates/${templateId}/documents/${documentId}`,
    data
  )
  return res.data
}

export const createEnvelope = async (
  accountId: string,
  templateId: string,
  signerEmail: string,
  signerName: string
) => {
  const data = {
    templateId: templateId,
    templateRoles: [
      {
        email: signerEmail,
        name: signerName,
        roleName: "signer",
      },
      {
        email: "silenceking80@gmail.com",
        name: "Silence King",
        roleName: "signer",
      },
      {
        email: "urbest920@gmail.com",
        name: "Urbest",
        roleName: "signer",
      },
    ],
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
