import * as React from "react"

interface EmailTemplateProps {
  name: string
  url: string
  investor: any
  fund: any
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  url,
  investor,
  fund,
}) => (
  <div>
    <p>Hi {name.split(" ")[0]},</p>
    <p>
      {investor.name.split(" ")[0]} from{" "}
      {fund.name} wants to make an investment in your company. Please
      follow <a href={url}>this link</a> to enter your information for the SAFE Agreement.
    </p>
  </div>
)
