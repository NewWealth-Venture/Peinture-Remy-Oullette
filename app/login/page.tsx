import { redirectIfAuthenticated } from "@/lib/auth/guards";
import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";

function LoginFormFallback() {
  return (
    <div className="w-full max-w-[400px] bg-neutral-white border border-neutral-border rounded-xl shadow-sm p-6 sm:p-8">
      <div className="h-14 w-40 bg-neutral-bg-subtle rounded mx-auto mb-6 animate-pulse" />
      <div className="h-6 w-32 bg-neutral-bg-subtle rounded mx-auto mb-2 animate-pulse" />
      <div className="h-4 w-48 bg-neutral-bg-subtle rounded mx-auto mb-6 animate-pulse" />
      <div className="space-y-4">
        <div className="h-12 bg-neutral-bg-subtle rounded-lg animate-pulse" />
        <div className="h-12 bg-neutral-bg-subtle rounded-lg animate-pulse" />
        <div className="h-12 bg-neutral-bg-subtle rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-bg-subtle px-4 py-8">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
