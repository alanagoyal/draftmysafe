import * as React from "react"

interface EmailTemplateProps {
  name: string
  url: string
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  url,
}) => (
  <div>
    <p>Hi {name.split(" ")[0]},</p>
    <p>
      Please click on this link to view the document: <a href={url}>{url}</a>
    </p>
  </div>
)
