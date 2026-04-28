import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { FileText, LayoutList, Settings2, Users, Zap } from "lucide-react";

import { PageShell, PageTitle, Panel } from "@/components/crm/page-shell";
import { cn } from "@/lib/utils";

const CARDS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/campaigns/list", label: "List", Icon: LayoutList },
  { href: "/campaigns/bulk-activity", label: "Bulk Activity", Icon: Users },
  { href: "/campaigns/setup", label: "Campaign Setup", Icon: Settings2 },
  { href: "/campaigns/templates", label: "Templates", Icon: FileText },
  { href: "/campaigns/triggers", label: "Triggers", Icon: Zap },
];

export default function CampaignsHubPage() {
  return (
    <PageShell>
      <PageTitle className="mb-6">Campaign</PageTitle>

      <Panel className="p-4 md:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-between rounded-lg border border-border bg-card px-5 py-5 shadow-sm transition-shadow",
                "hover:border-primary/25 hover:shadow-md",
              )}
            >
              <span className="text-[15px] font-medium text-foreground">{label}</span>
              <Icon className="h-7 w-7 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
            </Link>
          ))}
        </div>
      </Panel>
    </PageShell>
  );
}
