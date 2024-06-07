import * as React from "react"

interface EmailTemplateProps {
  emailContent: string
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  emailContent,
}) => (
  <div dangerouslySetInnerHTML={{ __html: emailContent }} />
)
