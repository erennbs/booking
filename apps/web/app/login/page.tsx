"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { login } from "@/lib/api/auth";
import { setStoredAuthState } from "@/lib/auth-storage";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <AuthForm
          title="Log in"
          submitLabel="Login"
          onSubmit={async ({ email, password }) => {
            const response = await login({ email, password });
            setStoredAuthState({
              user: response.user,
              accessToken: response.accessToken,
            });
            router.push("/consultant");
          }}
        />
        <p className="mt-4 text-center text-sm text-gray-600">
          New here?{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
