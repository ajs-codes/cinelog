import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CineLog - Your Personal Movie Log",
    short_name: "CineLog",
    description:
      "Track movies, TV series, build custom collections, and log your cinema journey.",
    start_url: "/",
    id: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    background_color: "#121314",
    theme_color: "#121314",
    orientation: "portrait-primary",
    scope: "/",
    categories: ["entertainment", "movies", "lifestyle"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/logo_dark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/logo_dark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/logo_light.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/logo_light.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "My Library",
        short_name: "Library",
        description: "View your saved movies, series, and custom lists",
        url: "/library",
        icons: [{ src: "/logo_dark.svg", sizes: "any" }],
      },
      {
        name: "Settings",
        short_name: "Settings",
        description: "Customize theme, profile, and collections",
        url: "/settings",
        icons: [{ src: "/logo_dark.svg", sizes: "any" }],
      },
    ],
  };
}
