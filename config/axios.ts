import axios, { AxiosInstance } from "axios"

export const axiosInstance = (): AxiosInstance => {
  const projectId = process.env.AMP_PROJECT_ID
  const apiKey = process.env.AMP_API_KEY
  const installationId = process.env.AMP_INSTALLATION_ID

  if (!projectId || !apiKey || !installationId) {
    throw new Error(
      "AMP_PROJECT_ID, AMP_API_KEY, and AMP_INSTALLATION_ID must be set in the environment"
    )
  }

  return axios.create({
    headers: {
      "x-amp-proxy-version": "1",
      "x-amp-project-id": projectId,
      "x-api-key": apiKey,
      "x-amp-installation-id": installationId,
    },
  })
}

export default axiosInstance
