import type { ProjectTableRow } from "./project-mocks";
import { findProjectRow } from "./project-mocks";

export type ProjectOverviewItem = { label: string; value: string };

export type ProjectDetailViewModel = {
  name: string;
  headerBannerText: string;
  overview: ProjectOverviewItem[];
  amenities: string[];
  highlights: string[];
  locationDisplay: string;
  unitTypesDisplay: string;
  carpetArea: string;
  possession: string;
  unitsCount: string;
  pricingLine: string;
  reraNo: string;
  gstNo: string;
  developer: string;
  architect: string;
};

const RAINBOW_LIFE_DETAIL: ProjectDetailViewModel = {
  name: "RAINBOW LIFE",
  headerBannerText: "N/A",
  overview: [
    { label: "Property Type", value: "Residential" },
    { label: "No. Of Towers", value: "1" },
    { label: "No. Of Floors", value: "37" },
    { label: "Floor wise Flats", value: "N/A" },
    { label: "Floor Wise Lifts", value: "N/A" },
    { label: "Parking", value: "Stilt Parking" },
  ],
  amenities: [
    "Swimming Pool",
    "Garden",
    "Gym",
    "Gazebo At Rooftop",
    "Meditation Zone",
    "Party Deck At Roof",
    "Kids Play Area",
    "24/7 Security",
  ],
  highlights: [
    "Proximity to Navi Mumbai Airport (15 Mins)",
    "Kharghar RLY STN (20 Mins)",
    "Mumbai-Pune Expressway (15 Mins)",
    "Atal Setu (30 Mins)",
    "Amandoot Metro STN (3 Mins)",
    "Proposed Kharghar Turbhe Linked Road (15 Mins)",
  ],
  locationDisplay: "N/A",
  unitTypesDisplay: "2BHK, 3BHK",
  carpetArea: "698 to 952 Sq. Ft.",
  possession: "N/A",
  unitsCount: "N/A",
  pricingLine: "1.12 crore * Onwards.",
  reraNo: "P52000078843",
  gstNo: "N/A",
  developer: "Ellora",
  architect: "N/A",
};

function unitTypesFromRow(unitTypes: string): string {
  const cleaned = unitTypes.replace(/^["']+|["']+$/g, "").trim();
  if (!cleaned || cleaned === "-" || cleaned === '""') return "N/A";
  return cleaned.replace(/,/g, ", ");
}

function buildFallback(row: ProjectTableRow): ProjectDetailViewModel {
  return {
    name: row.name,
    headerBannerText: "N/A",
    overview: [
      { label: "Property Type", value: row.category },
      { label: "No. Of Towers", value: "N/A" },
      { label: "No. Of Floors", value: "N/A" },
      { label: "Floor wise Flats", value: "N/A" },
      { label: "Floor Wise Lifts", value: "N/A" },
      { label: "Parking", value: "N/A" },
    ],
    amenities: ["Clubhouse", "Parking", "Power Backup", "Landscaping"],
    highlights: [
      row.address && row.address !== "—" ? `Located at ${row.address}` : "Prime location connectivity.",
      "Modern amenities and specifications.",
    ],
    locationDisplay: row.address && row.address !== "—" ? row.address : "N/A",
    unitTypesDisplay: unitTypesFromRow(row.unitTypes),
    carpetArea: "N/A",
    possession: "N/A",
    unitsCount: "N/A",
    pricingLine: "On request",
    reraNo: "N/A",
    gstNo: "N/A",
    developer: "N/A",
    architect: "N/A",
  };
}

export function getProjectDetailView(projectId: string): ProjectDetailViewModel | null {
  const row = findProjectRow(projectId);
  if (!row) return null;
  if (projectId === "91") return RAINBOW_LIFE_DETAIL;
  return buildFallback(row);
}
