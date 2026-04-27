import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border bg-card px-3 text-sm outline-none ring-primary/20 placeholder:text-muted-foreground focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}


