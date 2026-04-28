export type ProjectTableRow = {
  projectId: string;
  name: string;
  uuid: string;
  featured: boolean;
  published: boolean;
  address: string;
  category: string;
  subType: string;
  unitTypes: string;
};

export const MOCK_PROJECTS: ProjectTableRow[] = [
  {
    projectId: "91",
    name: "RAINBOW LIFE",
    uuid: "e4f8a2b1-6c3d-4e9f-a7b2-1d5e8f9a0c12",
    featured: true,
    published: true,
    address: "",
    category: "Residential",
    subType: "Flat",
    unitTypes: `"3BHK,3BHK,2BHK,2BHK"`,
  },
  {
    projectId: "95",
    name: "MARATHON NEXZONE",
    uuid: "b7c9d1e3-5f2a-48c6-9d4e-3a7f1b2c8e60",
    featured: false,
    published: true,
    address: "Palaspe Phata, Panvel, Navi Mumbai, Maharashtra 410221, India",
    category: "Residential",
    subType: "Flat",
    unitTypes: `"3BHK, 2BHK, 1RK"`,
  },
  {
    projectId: "116",
    name: "ARIHANT ASPIRE",
    uuid: "9a2f4c6e-8b1d-47f3-a5c9-2e8d4f6a1b30",
    featured: true,
    published: true,
    address: "Palaspe Phata, Panvel, Navi Mumbai, Maharashtra 410221, India",
    category: "Residential",
    subType: "Flat",
    unitTypes: `"3BHK, 2BHK, 1RK"`,
  },
  {
    projectId: "31",
    name: "SILVER HEIGHTS",
    uuid: "1d3e5f7a-9c2b-4e6f-8a1c-5d7e9f2b4a68",
    featured: false,
    published: false,
    address: "—",
    category: "Residential",
    subType: "Flat",
    unitTypes: "-",
  },
  {
    projectId: "66",
    name: "GODREJ CITY",
    uuid: "6f8a0b2c-4d1e-49a3-b7f5-3c9e1d5f7a92",
    featured: false,
    published: true,
    address: "",
    category: "Residential",
    subType: "Flat",
    unitTypes: `""`,
  },
  {
    projectId: "12",
    name: "HIRCOSTAR RESIDENCY",
    uuid: "3c5e7f9a-1b2d-4f6e-8c0a-4e6f8a0b2d14",
    featured: true,
    published: false,
    address: "Vashi, Navi Mumbai, Maharashtra, India",
    category: "Residential",
    subType: "Flat",
    unitTypes: `"2BHK, 3BHK"`,
  },
  {
    projectId: "88",
    name: "BALAJI SYMPHONY",
    uuid: "8e0f2a4b-6c8d-41e3-f9a5-7b1d3f5e9c70",
    featured: false,
    published: true,
    address: "",
    category: "Residential",
    subType: "Flat",
    unitTypes: `"4BHK, 3BHK"`,
  },
  {
    projectId: "102",
    name: "PRIME TOWERS",
    uuid: "0a2c4e6f-8a0b-42d4-e6f8-0a2c4e6f8a0b",
    featured: false,
    published: false,
    address: "Kharghar, Navi Mumbai, Maharashtra 410210, India",
    category: "Residential",
    subType: "Flat",
    unitTypes: `"2BHK"`,
  },
];

export function findProjectRow(projectId: string): ProjectTableRow | undefined {
  return MOCK_PROJECTS.find((p) => p.projectId === projectId);
}
