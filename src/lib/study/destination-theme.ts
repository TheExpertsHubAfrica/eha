import type { StudyDestination } from "@/lib/catalog/types";
import { siteImages } from "@/lib/site-images";

export type StudyDestinationTheme = {
  countryCode: string;
  flag: string;
  image: string;
  imageAlt: string;
  panelText: string;
};

const themes: Record<string, Omit<StudyDestinationTheme, "flag">> = {
  canada: {
    countryCode: "CA",
    image: siteImages.study.destinations.canada,
    imageAlt: "CN Tower on the Toronto waterfront, Canada",
    panelText: "text-white",
  },
  "united-states": {
    countryCode: "US",
    image: siteImages.study.destinations.unitedStates,
    imageAlt: "Statue of Liberty in New York Harbor, United States",
    panelText: "text-white",
  },
  "united-kingdom": {
    countryCode: "GB",
    image: siteImages.study.destinations.unitedKingdom,
    imageAlt: "Tower Bridge over the River Thames, United Kingdom",
    panelText: "text-white",
  },
  schengen: {
    countryCode: "EU",
    image: siteImages.study.destinations.schengen,
    imageAlt: "Eiffel Tower in Paris, France — Schengen / Europe",
    panelText: "text-white",
  },
};

const defaultTheme: StudyDestinationTheme = {
  countryCode: "",
  flag: "🎓",
  image: siteImages.study.hero,
  imageAlt: "Study abroad destination",
  panelText: "text-white",
};

function flagEmoji(countryCode: string) {
  if (countryCode === "EU") return "🇪🇺";
  if (countryCode.length !== 2) return "🌍";
  const upper = countryCode.toUpperCase();
  return String.fromCodePoint(
    ...[...upper].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65),
  );
}

export function studyDestinationTheme(
  destination: Pick<StudyDestination, "slug" | "name">,
): StudyDestinationTheme {
  const theme = themes[destination.slug];
  if (!theme) return defaultTheme;
  return {
    ...theme,
    flag: flagEmoji(theme.countryCode),
  };
}
