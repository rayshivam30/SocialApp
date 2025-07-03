import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-green-400 to-blue-400 rounded-full opacity-20 blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl -translate-x-1/2 translate-y-1/2"></div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <SignupForm />
      </div>
    </div>
  )
}
