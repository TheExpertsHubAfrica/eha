import type { StudyDestination } from "@/lib/catalog/types";

export type StudyDestinationTheme = {
  countryCode: string;
  flag: string;
  gradient: string;
  panelText: string;
};

const themes: Record<string, Omit<StudyDestinationTheme, "flag">> = {
  canada: {
    countryCode: "CA",
    gradient: "from-[#D52B1E] via-[#B91C1C] to-[#1C1B18]",
    panelText: "text-white",
  },
  "united-states": {
    countryCode: "US",
    gradient: "from-[#3C3B6E] via-[#B22234] to-[#1C1B18]",
    panelText: "text-white",
  },
  "united-kingdom": {
    countryCode: "GB",
    gradient: "from-[#012169] via-[#C8102E]/85 to-[#1C1B18]",
    panelText: "text-white",
  },
  schengen: {
    countryCode: "EU",
    gradient: "from-[#003399] via-[#003399]/90 to-[#8F7330]",
    panelText: "text-white",
  },
};

const defaultTheme: StudyDestinationTheme = {
  countryCode: "",
  flag: "🎓",
  gradient: "from-ash-800 via-ash-700 to-gold-deep",
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
