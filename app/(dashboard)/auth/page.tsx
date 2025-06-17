import AuthForm from "@/components/auth/AuthForm"
import { Suspense } from "react"

function AuthPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthForm/>
    </Suspense>
  )
}

export default AuthPage

function LoadingFallback() {
  return (
    // <CardWrapper headerTitle="Checking Reset Status" backButtonLabel="Back to login" backButtonHref="/auth/login">
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
      </div>
    // </CardWrapper>
  )
}