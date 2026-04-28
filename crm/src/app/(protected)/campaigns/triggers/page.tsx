import Link from "next/link";

import { PageShell, PageTitle } from "@/components/crm/page-shell";

export default function CampaignTriggersPage() {
  return (
    <PageShell>
      <Link href="/campaigns" className="mb-2 inline-block text-sm font-medium text-primary hover:underline">
        ← Campaign
      </Link>
      <PageTitle className="mb-2">Triggers</PageTitle>
      <p className="text-sm text-muted-foreground">Campaign triggers will appear here.</p>
    </PageShell>
  );
}
