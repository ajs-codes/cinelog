import type { LucideIcon } from "lucide-react";
import { Settings, SlidersHorizontal, Sparkles, User } from "lucide-react";

export type SettingsNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export type SettingsNavGroup = {
  label: string;
  items: SettingsNavItem[];
};

/** Single source for settings title, description, route, and icon. */
export const SETTINGS = {
  href: "/settings",
  icon: Settings,
  title: "Settings & Preferences",
  navLabel: "Settings",
  description:
    "Manage your profile, content preferences, and smart collections.",
  landingHint: "Choose a setting to get started.",
} as const;

export const SETTINGS_ROOT_ITEM: SettingsNavItem = {
  label: SETTINGS.title,
  href: SETTINGS.href,
  icon: SETTINGS.icon,
  description: SETTINGS.description,
};

export const SETTINGS_NAV_GROUPS: SettingsNavGroup[] = [
  {
    label: "Account",
    items: [
      { label: "User Profile", href: "/settings/profile", icon: User },
      {
        label: "Content Preferences",
        href: "/settings/preferences",
        icon: Sparkles,
      },
    ],
  },
  {
    label: "Collections",
    items: [
      {
        label: "Smart Collections",
        href: "/settings/collections",
        icon: SlidersHorizontal,
      },
    ],
  },
];
