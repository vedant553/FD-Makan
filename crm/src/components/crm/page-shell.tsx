import { cn } from "@/lib/utils";

/** Standard page canvas: soft gray background + consistent horizontal padding (4 / 8 spacing scale). */
export function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "min-h-full bg-crm-canvas p-4 font-sans text-foreground antialiased md:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Top-level page heading — one per route for hierarchy. */
export function PageTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h1 className={cn("mb-4 text-lg font-semibold tracking-tight text-foreground", className)}>{children}</h1>;
}

/** White elevated surface for filters, tables, and grouped content. */
export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PanelHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("border-b border-border px-4 py-3 md:px-5", className)}>{children}</div>;
}
