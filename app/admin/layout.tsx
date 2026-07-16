import { Suspense } from "react";
import { getSessionUser } from "@/lib/dal";
import { signIn, signOut } from "@/auth";
import { AdminNav } from "@/components/admin-nav";
import { SignInError } from "@/components/sign-in-error";
import { GoogleIcon } from "@/components/google-icon";
import { SubmitButton } from "@/components/submit-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-128 w-lg -translate-x-1/2 -translate-y-1/3 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <div className="relative flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-white/10 bg-white/4 p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 text-2xl font-bold text-white shadow-lg shadow-emerald-500/30">
            D
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold text-white">Admin access</h1>
            <p className="text-sm text-zinc-400">
              Sign in with the Google account tied to this store to manage
              products and orders.
            </p>
          </div>

          <Suspense fallback={null}>
            <SignInError />
          </Suspense>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/admin" });
            }}
            className="w-full"
          >
            <SubmitButton
              pendingLabel="Signing in…"
              className="flex w-full items-center justify-center gap-3 rounded-full bg-white py-3 font-semibold text-zinc-900 shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:opacity-70"
            >
              <GoogleIcon />
              Continue with Google
            </SubmitButton>
          </form>

          <p className="text-xs text-zinc-500">
            Not on the list? You&apos;ll need an invite from the store owner.
          </p>
        </div>
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/4 p-10 text-center shadow-2xl backdrop-blur-xl">
          <h1 className="text-xl font-semibold text-white">Not authorized</h1>
          <p className="text-sm text-zinc-400">
            Signed in as {user.email}, but this account doesn&apos;t have
            admin access.
          </p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <SubmitButton
              pendingLabel="Signing out…"
              className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
            >
              Sign out
            </SubmitButton>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 bg-white px-6 py-4">
        <p>
          Good evening :{" "}
          <span className="font-semibold text-blue-600">{user.name}</span>
        </p>
        <div className="flex items-center gap-6">
          <AdminNav permissions={user.permissions} />
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <SubmitButton
              pendingLabel="Signing out…"
              className="flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-60"
            >
              Sign out
            </SubmitButton>
          </form>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
