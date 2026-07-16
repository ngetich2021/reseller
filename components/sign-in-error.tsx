"use client";

import { useSearchParams } from "next/navigation";

export function SignInError() {
  const params = useSearchParams();
  const error = params.get("error");
  if (!error) return null;

  const message =
    error === "AccessDenied"
      ? "That Google account isn't on the admin list. Ask the site owner to invite you."
      : "Something went wrong signing you in. Please try again.";

  return (
    <p className="w-full rounded-lg bg-red-50 px-4 py-2.5 text-center text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
      {message}
    </p>
  );
}
