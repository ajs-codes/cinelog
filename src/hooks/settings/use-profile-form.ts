"use client";

import { useState, type FormEvent } from "react";
import { useAppDispatch } from "@/store";
import { userUpdated, type User } from "@/store/slices/authSlice";
import { apiFetch } from "@/lib/http/client";
import { updateProfileSchema } from "@/lib/validations/auth";

function profileErrorMessage(data: { error?: string; details?: unknown }) {
  if (Array.isArray(data.details)) {
    const first = data.details[0];
    if (
      first &&
      typeof first === "object" &&
      "message" in first &&
      typeof first.message === "string" &&
      first.message.trim()
    ) {
      return first.message;
    }
  }

  return data.error || "Failed to update profile.";
}

export function useProfileForm(user: User | null) {
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!user) {
      setErrorMessage("You must be signed in to update your profile.");
      return;
    }

    if (confirmPassword && !newPassword) {
      setErrorMessage("Enter a new password or clear the confirmation field.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    const payload: Record<string, unknown> = {};
    if (username.trim() !== user.username) payload.username = username.trim();
    if (email.trim() !== user.email) payload.email = email.trim();
    if (displayName.trim() !== (user.displayName || "").trim()) {
      payload.displayName = displayName.trim() || null;
    }
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    const parsed = updateProfileSchema.safeParse(payload);
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Validation failed");
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiFetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(profileErrorMessage(data));
        setIsLoading(false);
        return;
      }

      const updatedUser = data.user ?? data.data?.user;
      if (updatedUser) {
        dispatch(userUpdated({ user: updatedUser }));
      }

      setSuccessMessage("Profile updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setErrorMessage("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    username,
    setUsername,
    email,
    setEmail,
    displayName,
    setDisplayName,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    successMessage,
    errorMessage,
    handleSubmit,
  };
}
