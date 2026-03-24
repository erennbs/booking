"use client";

import { FormEvent, useState } from "react";

type AuthFormValues = {
  email: string;
  password: string;
  name?: string;
};

type AuthFormProps = {
  title: string;
  submitLabel: string;
  includeName?: boolean;
  onSubmit: (values: AuthFormValues) => Promise<void>;
};

export function AuthForm({
  title,
  submitLabel,
  includeName = false,
  onSubmit,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        email,
        password,
        ...(includeName ? { name } : {}),
      });
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Something went wrong";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>

      <div className="mt-6 space-y-4">
        {includeName ? (
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Name</span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-blue-600 focus:ring-2"
              placeholder="Jane Doe"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-blue-600 focus:ring-2"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Password</span>
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-blue-600 focus:ring-2"
            placeholder="********"
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isSubmitting ? "Please wait..." : submitLabel}
      </button>
    </form>
  );
}
