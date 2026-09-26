import type { Metadata } from "next";
import { UserProfileSection } from "@/components/settings/user-profile-section";

export const metadata: Metadata = {
  title: "User Profile · Settings",
  description: "Update your account identity, email address, and password.",
};

export default function SettingsProfilePage() {
  return <UserProfileSection />;
}
