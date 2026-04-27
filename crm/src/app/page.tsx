import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth/guards";

export default async function HomePage() {
  const session = await getAuthSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  redirect("/login");
}


