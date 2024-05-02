import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formDescriptions = {
  companyName: "The name of the company",
  fundName: "The name of the investing entity",
  fundByline: "The byline for the investing entity",
  purchaseAmount: "The amount being invested",
  investmentType:
    "The type of SAFE agreement (Valuation Cap, Discount, or MFN)",
  valuationCap: "The valuation cap of the investment",
  discount: "The discount of the investment",
  stateOfIncorporation: "The state of incorporation of the company",
  date: "The approximate date of the SAFE agreement",
  investorName: "The name of the investing entity's signatory",
  investorTitle: "The title of the investing entity's signatory",
  investorEmail: "The email of the investing entity's signatory",
  fundStreet: "The street address of the investing entity",
  fundCityStateZip: "The city, state, and ZIP code of the investing entity",
  founderName: "The name of the company's signatory",
  founderTitle: "The title of the company's signatory",
  founderEmail: "The email of the company's signatory",
  companyStreet: "The street address of the company",
  companyCityStateZip: "The city, state, and ZIP code of the company",
}