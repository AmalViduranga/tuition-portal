"use client";

import { useFormStatus } from "react-dom";

export function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in..." : "Sign In"}
    </button>
  );
}
