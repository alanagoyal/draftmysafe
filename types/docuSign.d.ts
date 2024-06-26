interface Signer {
  email: string
  name: string
  roleName: "signer"
}

interface IanchorData {
  anchorString: string
  anchorUnits: string
  anchorXOffset?: number
  anchorYOffset?: number
}
