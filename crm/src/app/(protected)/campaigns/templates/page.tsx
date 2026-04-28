import Link from "next/link";

import { PageShell, PageTitle } from "@/components/crm/page-shell";

export default function CampaignTemplatesPage() {
  return (
    <PageShell>
      <Link href="/campaigns" className="mb-2 inline-block text-sm font-medium text-primary hover:underline">
        ← Campaign
      </Link>
      <PageTitle className="mb-2">Templates</PageTitle>
      <p className="text-sm text-muted-foreground">Campaign templates will appear here.</p>
    </PageShell>
  );
}
