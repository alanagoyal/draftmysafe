// Convert file to base64 string
import fs from "fs/promises"
import path from "path"

// export const fileToBase64 = async (filename: string, filepath: string) => {
//   const response = await fetch(filepath)
//   console.log("response", response)
//   const fileBlob = await response.blob()
//   const reader = new FileReader()
//   await new Promise((resolve) => {
//     reader.onloadend = resolve
//     reader.readAsDataURL(fileBlob)
//   })

//   if (reader.result === null) {
//     throw new Error("Failed to convert file to base64")
//   }

//   if (typeof reader.result !== "string") {
//     throw new Error("Failed to convert file to base64")
//   }

//   const base64File = reader.result.split(",")[1]
//   return base64File
// }

export const fileToBase64 = async (filename: string, filepath: string) => {
  try {
    const filePath = path.join(filepath, filename)
    const fileBuffer = await fs.readFile(filePath)
    const base64File = fileBuffer.toString("base64")
    return base64File
  } catch (error) {
    console.error("Failed to convert file to base64", error)
  }
}
