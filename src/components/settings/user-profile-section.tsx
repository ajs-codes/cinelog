"use client";

import { useState } from "react";
import { Check, KeyRound, Loader2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store";
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
      setErrorMessage(
        parsed.error.issues[0]?.message ?? "Validation failed",
      );
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
                minLength={3}
                maxLength={10}
                pattern="[A-Za-z0-9_]+"
                required
                disabled={!user || isLoading}
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
                disabled={!user || isLoading}
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
                disabled={!user || isLoading}
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
              Leave blank to keep your current password. New passwords need 6–20
              characters, upper and lower case, a number, and one of @ # & ! _
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
                disabled={!user || isLoading}
                autoComplete="current-password"
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
                disabled={!user || isLoading}
                autoComplete="new-password"
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
                disabled={!user || isLoading}
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!user || isLoading}
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
