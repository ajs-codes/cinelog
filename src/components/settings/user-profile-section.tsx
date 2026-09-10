"use client";

import { useState } from "react";
import { Check, KeyRound, Loader2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store";
import { userUpdated, type User } from "@/store/slices/authSlice";

export function UserProfileSection() {
  const { user } = useAppSelector((state) => state.auth);

  return <UserProfileForm key={user?.id ?? "guest"} user={user} />;
}

function UserProfileForm({ user }: { user: User | null }) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    if (newPassword && !currentPassword) {
      setErrorMessage("Current password is required to set a new password.");
      return;
    }

    setIsLoading(true);

    try {
      const payload: Record<string, unknown> = {};
      if (username !== user?.username) payload.username = username;
      if (email !== user?.email) payload.email = email;
      if (displayName !== (user?.displayName || ""))
        payload.displayName = displayName || null;
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      if (Object.keys(payload).length === 0) {
        setErrorMessage("No changes to save.");
        setIsLoading(false);
        return;
      }

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to update profile.");
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
  };

  return (
    <section
      aria-labelledby="profile-settings-heading"
      className="w-full space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary-container/20 text-brand-primary">
          <UserIcon className="h-4.5 w-4.5" />
        </div>
        <div>
          <h2
            id="profile-settings-heading"
            className="font-heading text-xl font-semibold tracking-tight text-on-surface sm:text-2xl"
          >
            User Profile & Credentials
          </h2>
          <p className="font-public-sans text-xs text-secondary">
            Update your account identity, email address, and authentication
            passkeys.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-status-success/30 bg-status-success/10 px-4 py-3 font-public-sans text-xs text-status-success">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg border border-status-error/30 bg-status-error/10 px-4 py-3 font-public-sans text-xs text-status-error">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-outline-alt bg-surface-container-low p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="username-input"
                className="font-public-sans text-xs font-medium text-on-surface"
              >
                Username
              </label>
              <Input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (3-10 characters)"
                className="border-outline-alt bg-surface-container"
                required
              />
              <p className="font-public-sans text-[11px] text-secondary">
                Alphanumeric characters and underscores only.
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email-input"
                className="font-public-sans text-xs font-medium text-on-surface"
              >
                Email Address
              </label>
              <Input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="border-outline-alt bg-surface-container"
                required
              />
              <p className="font-public-sans text-[11px] text-secondary">
                Used for account identification and notifications.
              </p>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label
                htmlFor="display-name-input"
                className="font-public-sans text-xs font-medium text-on-surface"
              >
                Display Name (Optional)
              </label>
              <Input
                id="display-name-input"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Public Name"
                className="border-outline-alt bg-surface-container"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-outline-alt bg-surface-container-low p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-secondary">
            <KeyRound className="h-4 w-4 text-brand-primary shrink-0" />
            <h3 className="font-heading text-sm font-semibold text-on-surface">
              Change Password
            </h3>
            <span className="font-public-sans text-[11px] text-outline-muted">
              (Leave blank if keeping current password)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label
                htmlFor="current-password-input"
                className="font-public-sans text-xs font-medium text-on-surface"
              >
                Current Password
              </label>
              <Input
                id="current-password-input"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="border-outline-alt bg-surface-container"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="new-password-input"
                className="font-public-sans text-xs font-medium text-on-surface"
              >
                New Password
              </label>
              <Input
                id="new-password-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="border-outline-alt bg-surface-container"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password-input"
                className="font-public-sans text-xs font-medium text-on-surface"
              >
                Confirm New Password
              </label>
              <Input
                id="confirm-password-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="border-outline-alt bg-surface-container"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="h-10 min-w-36 rounded-lg bg-brand-primary font-medium text-surface hover:bg-brand-primary/90"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
