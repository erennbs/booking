"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { register } from "@/lib/api/auth";
import { setStoredAuthState } from "@/lib/auth-storage";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <AuthForm
          title="Create account"
          submitLabel="Register"
          includeName
          onSubmit={async ({ email, password, name }) => {
            const response = await register({ email, password, name: name ?? "" });
            setStoredAuthState({
              user: response.user,
              accessToken: response.accessToken,
            });
            router.push("/consultant");
          }}
        />
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
