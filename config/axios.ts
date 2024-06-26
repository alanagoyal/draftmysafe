import axios, { AxiosInstance } from "axios"

export const axiosInstance = (): AxiosInstance => {
  return axios.create({
    headers: {
      "x-amp-proxy-version": "1",
      "x-amp-project-id": "84fc38d8-135f-4fd8-a0c5-58acc27b0d5e",
      "x-api-key": "VFERSQ3STQWZKRPO7K3FLPEH4ZU4TJAL7VUEN3Q",
      "x-amp-installation-id": "d7739ce4-e4aa-4a70-9fb4-d9a9f439ff98",
    },
  })
}

export default axiosInstance
