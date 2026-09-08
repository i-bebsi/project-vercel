import RegisterForm from "@/components/auth/RegisterForm"

export const dynamic = "force-dynamic"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <RegisterForm />
    </div>
  )
}
