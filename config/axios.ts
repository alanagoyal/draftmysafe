import axios, { AxiosInstance } from "axios"

import { TOKEN } from "@/lib/constants"

export const axiosInstance = (): AxiosInstance => {
  return axios.create({
    headers: { Authorization: `Bearer ${TOKEN ?? ""}` },
  })
}

export default axiosInstance
