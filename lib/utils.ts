import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formDescriptions = {
  companyName: "The full legal name of the company",
  fundName: "The full legal name of the investing entity",
  fundByline: "The byline for the investing entity",
  purchaseAmount: "The amount being invested in USD",
  investmentType:
    "The type of SAFE agreement (Valuation Cap, Discount, or MFN)",
  valuationCap: "The valuation cap of the investment in USD",
  discount: "The discount rate of the investment as a percentage of the investment price",
  stateOfIncorporation: "The state of incorporation of the company",
  date: "The approximate date of the SAFE agreement",
  investorName: "The full legal name of the investing entity's signatory",
  investorTitle: "The title of the investing entity's signatory",
  investorEmail: "The email address of the investing entity's signatory",
  fundStreet: "The street address of the investing entity",
  fundCityStateZip: "The city, state, and ZIP code of the investing entity",
  founderName: "The full legal name of the company's signatory",
  founderTitle: "The title of the company's signatory",
  founderEmail: "The email address of the company's signatory",
  companyStreet: "The street address of the company",
  companyCityStateZip: "The city, state, and ZIP code of the company",
}