"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full flex justify-center items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Signing in...</span>
        </>
      ) : (
        "Sign In"
      )}
    </button>
  );
}

