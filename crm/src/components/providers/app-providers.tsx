"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { setApiAuthInterceptor } from "@/lib/api-client/request";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    setApiAuthInterceptor(({ status }) => {
      if (typeof window === "undefined") return;
      if (status === 401) {
        window.location.href = "/login";
        return;
      }
      window.dispatchEvent(new CustomEvent("tasks-api-forbidden"));
    });

    return () => setApiAuthInterceptor(null);
  }, []);

  return (
    <SessionProvider basePath="/api/auth">
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}


