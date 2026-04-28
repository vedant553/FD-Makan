import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  Bed,
  Bookmark,
  Building2,
  Home,
  KeyRound,
  MapPin,
  Minus,
  Phone,
  Ruler,
  Share2,
} from "lucide-react";
import Link from "next/link";

import { getProjectDetailView } from "../../project-detail-data";

const BRAND_GREEN = "bg-[#1B8354]";
const BRAND_GREEN_TEXT = "text-[#1B8354]";
const PAGE_BG = "bg-[#F5F5F5]";

type PageProps = { params: Promise<{ projectId: string }> };

export default async function ProjectPublicViewPage({ params }: PageProps) {
  const { projectId } = await params;
  const data = getProjectDetailView(projectId);
  if (!data) notFound();

  return (
    <div className={`min-h-screen ${PAGE_BG} font-sans text-gray-900`}>
      <header className={`${BRAND_GREEN} py-3 text-center text-sm font-medium text-white`}>{data.headerBannerText}</header>

      <div className="mx-auto max-w-6xl gap-5 px-4 py-5 md:px-5 lg:grid lg:grid-cols-3 lg:items-start">
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-lg border border-gray-200/80 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-gray-900">Project Overview of {data.name}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.overview.map((item) => (
                <div key={item.label} className="flex gap-2.5">
                  <Minus className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" strokeWidth={2.5} aria-hidden />
                  <div>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200/80 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-gray-900">Amenities of {data.name}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.amenities.map((a) => (
                <div key={a} className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                    <Home className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="text-sm font-medium text-gray-900">{a}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200/80 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-gray-900">Key Highlights of {data.name}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.highlights.map((h) => (
                <div key={h} className="flex items-start gap-2.5">
                  <Bookmark className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                  <span className="text-sm leading-snug text-gray-900">{h}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="mt-5 rounded-lg border border-gray-200/80 bg-white p-5 shadow-sm lg:mt-0">
          <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-4">
            <h2 className={`text-lg font-bold ${BRAND_GREEN_TEXT}`}>{data.name}</h2>
            <button type="button" className="rounded p-1.5 text-gray-600 hover:bg-gray-100" aria-label="Share">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-4 flex items-start gap-2 text-sm text-gray-800">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden />
            <span>{data.locationDisplay}</span>
          </p>

          <div className="mt-5 space-y-0 divide-y divide-gray-100 border-t border-gray-100">
            <SpecRow icon={<Bed className="h-4 w-4" />} label="Unit Type" value={data.unitTypesDisplay} />
            <SpecRow icon={<Ruler className="h-4 w-4" />} label="Carpet Area" value={data.carpetArea} />
            <SpecRow icon={<KeyRound className="h-4 w-4" />} label="Possession" value={data.possession} />
            <SpecRow icon={<Building2 className="h-4 w-4" />} label="No. of Units" value={data.unitsCount} />
          </div>

          <p className="mt-5 text-base font-bold text-gray-900">{data.pricingLine}</p>

          <button
            type="button"
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg ${BRAND_GREEN} py-3.5 text-sm font-semibold text-white shadow-sm hover:opacity-95`}
          >
            <Phone className="h-5 w-5" aria-hidden />
            Contact Us
          </button>

          <ul className="mt-6 space-y-3 border-t border-gray-100 pt-5 text-xs text-gray-700">
            <li>
              <span className="font-semibold text-gray-900">Rera No.: </span>
              {data.reraNo}
            </li>
            <li>
              <span className="font-semibold text-gray-900">GST No.: </span>
              {data.gstNo}
            </li>
            <li>
              <span className="font-semibold text-gray-900">Developer: </span>
              {data.developer}
            </li>
            <li>
              <span className="font-semibold text-gray-900">Architect: </span>
              {data.architect}
            </li>
          </ul>

          <p className="mt-6 text-center">
            <Link href="/crm/projects" className="text-sm font-medium text-[#1a56db] hover:underline">
              ← Back to Projects
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}

function SpecRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 py-3.5">
      <span className="mt-0.5 shrink-0 text-gray-500">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
