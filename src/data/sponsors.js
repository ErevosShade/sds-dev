// To swap logos: replace the `logo` path with your image path.
// To add a new sponsor: copy a slot object and fill in the fields.
// Tiers: "platinum" | "gold" | "silver" | "community"
export const SPONSORS = [
  // PLATINUM
  { id: 1, name: "Sponsor Name", logo: "/images/sponsors/platinum-1.svg", tier: "platinum", url: "#" },
  { id: 2, name: "Sponsor Name", logo: "/images/sponsors/platinum-2.svg", tier: "platinum", url: "#" },
  // GOLD
  { id: 3, name: "Sponsor Name", logo: "/images/sponsors/gold-1.svg", tier: "gold", url: "#" },
  { id: 4, name: "Sponsor Name", logo: "/images/sponsors/gold-2.svg", tier: "gold", url: "#" },
  { id: 5, name: "Sponsor Name", logo: "/images/sponsors/gold-3.svg", tier: "gold", url: "#" },
  // SILVER
  { id: 6, name: "Sponsor Name", logo: "/images/sponsors/silver-1.svg", tier: "silver", url: "#" },
  { id: 7, name: "Sponsor Name", logo: "/images/sponsors/silver-2.svg", tier: "silver", url: "#" },
  { id: 8, name: "Sponsor Name", logo: "/images/sponsors/silver-3.svg", tier: "silver", url: "#" },
  { id: 9, name: "Sponsor Name", logo: "/images/sponsors/silver-4.svg", tier: "silver", url: "#" },
];

export const TIER_CONFIG = {
  platinum: { label: "Platinum", logoHeight: 56 },
  gold:     { label: "Gold",     logoHeight: 40 },
  silver:   { label: "Silver",   logoHeight: 28 },
};
