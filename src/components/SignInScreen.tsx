"use client";

import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";

/**
 * Sign in screen
 */
export default function SignInScreen() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4">
      <section className="card max-w-md text-center">
        <h1 className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
          Banger Arenas
        </h1>
        <p className="card-title mb-1">Welcome</p>
        <p className="mb-6 text-sm text-slate-300">
          Connect with CDP to start betting on whether tweets become bangers.
        </p>
        <div className="flex justify-center">
          <AuthButton />
        </div>
      </section>
    </main>
  );
}
