"use client"
import { AmpersandProvider, InstallIntegration } from "@amp-labs/react"

const options = {
  projectId: process.env.NEXT_PUBLIC_AMPERSAND_PROJECT_ID!, 
  apiKey: process.env.NEXT_PUBLIC_AMPERSAND_API_KEY!
}
export function DocusignAuthProvider({user}: {user: any}) {
  return (
    <AmpersandProvider options={options}>
      <InstallIntegration
        integration="docusignDeveloperIntegration"
        consumerRef={user.auth_id}
        consumerName={user.name}
        groupRef={user.auth_id}
        groupName={user.name}
        onInstallSuccess={(installationId, configObject) =>
          console.log(
            `Successfully installed ${installationId} with configuration ${JSON.stringify(
              configObject,
              null,
              2
            )}`
          )
        }
        onUpdateSuccess={(installationId, configObject) =>
          console.log(
            `Successfully updated ${installationId} with configuration ${JSON.stringify(
              configObject,
              null,
              2
            )}`
          )
        }
      />
    </AmpersandProvider>
  )
}
