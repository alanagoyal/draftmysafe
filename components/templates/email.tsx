import * as React from "react"

interface EmailTemplateProps {
  investmentData: any
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  investmentData,
}) => (
  <div>
    <p>Hi {investmentData.founder.name.split(" ")[0]},</p>
    <p>
      {investmentData.fund.name} has shared a SAFE agreement with you. Please
      find the document attached to this email and find a brief summary of the
      document and its terms below.
    </p>
    <p>{investmentData.summary}</p>
    <p>
      Disclaimer: This summary is for informational purposes only and does not
      constitute legal advice. For any legal matters or specific questions, you
      should consult with a qualified attorney.
    </p>
  </div>
)
