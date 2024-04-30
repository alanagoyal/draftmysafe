import AuthRefresh from "@/components/auth-refresh"
import FormComponent from "@/components/form-component"


export default async function Safe() {
  return (
    <div className="w-full">
      <AuthRefresh/>
      <FormComponent />
    </div>
  )
}
