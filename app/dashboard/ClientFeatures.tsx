"use client";

import { useState, useTransition } from "react";
import { updatePassword } from "./actions";
import { Button, Input } from "@/components/ui";
import { WhatsAppButton as SharedWhatsAppButton } from "@/components/ui/WhatsAppButton";

export function PasswordChangeForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ error?: string; success?: boolean } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password.length < 6) return setMessage({ error: "Password must be at least 6 characters" });
    if (password !== confirm) return setMessage({ error: "Passwords do not match" });

    startTransition(async () => {
      const res = await updatePassword(formData);
      if (res.error) {
        setMessage({ error: res.error });
      } else {
        setMessage({ success: true });
        form.reset();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message?.error && (
        <div role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
          {message.error}
        </div>
      )}
      {message?.success && (
        <div role="status" className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-3 text-sm text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
          Password updated successfully!
        </div>
      )}
      <div className="space-y-3">
        <Input 
          label="New Password" 
          name="password" 
          type="password" 
          placeholder="Min 6 characters"
          required 
        />
        <Input 
          label="Confirm Password" 
          name="confirm" 
          type="password" 
          placeholder="Repeat new password"
          required 
        />
      </div>
      <Button type="submit" loading={isPending} className="w-full justify-center">
        Update Password
      </Button>
    </form>
  );
}

export function WhatsAppButton({ whatsappNumber }: { whatsappNumber?: string }) {
  return (
    <SharedWhatsAppButton
      phone={whatsappNumber}
      message="Hi, I need support with my MathsLK student portal account."
      className="w-full"
    />
  );
}
