import Link from "next/link";

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose a section to continue.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/accounts/ledger"
          className="rounded-xl border bg-card p-5 transition-colors hover:border-primary hover:bg-primary/5"
        >
          <h2 className="text-lg font-semibold text-foreground">Ledger</h2>
          <p className="mt-1 text-sm text-muted-foreground">View account ledgers and balances.</p>
        </Link>

        <Link
          href="/accounts/voucher"
          className="rounded-xl border bg-card p-5 transition-colors hover:border-primary hover:bg-primary/5"
        >
          <h2 className="text-lg font-semibold text-foreground">Voucher</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create and manage accounting vouchers.</p>
        </Link>
      </div>
    </div>
  );
}
