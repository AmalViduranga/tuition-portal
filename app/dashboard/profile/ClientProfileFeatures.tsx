"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "./actions";
import { Button, Input } from "@/components/ui";

interface ProfileEditProps {
  initialName: string;
  initialPhone: string;
}

export function ProfileEditForm({ initialName, initialPhone }: ProfileEditProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ error?: string; success?: boolean } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("full_name") as string;
    
    if (name.trim().length < 3) {
      return setMessage({ error: "Full name must be at least 3 characters." });
    }

    startTransition(async () => {
      setMessage(null);
      const res = await updateProfile(formData);
      if (res.error) {
        setMessage({ error: res.error });
      } else {
        setMessage({ success: true });
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message?.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {message.error}
        </div>
      )}
      {message?.success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200">
          Profile updated successfully!
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <Input 
            label="Full Name" 
            name="full_name" 
            type="text" 
            defaultValue={initialName}
            placeholder="e.g. Supun Silva"
            required 
          />
        </div>
        <div>
          <Input 
            label="Phone Number" 
            name="phone" 
            type="tel" 
            defaultValue={initialPhone || ""}
            placeholder="e.g. 0771234567"
          />
        </div>
      </div>
      
      <div className="pt-2 flex justify-end">
        <Button type="submit" loading={isPending}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
