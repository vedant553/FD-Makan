"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          />
          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button
            className="w-full"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              const res = await signIn("credentials", {
                email: form.email,
                password: form.password,
                redirect: false,
              });

              if (res?.error) {
                setError("Invalid credentials");
              } else {
                router.push("/dashboard");
              }

              setLoading(false);
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => router.push("/signup")}>
            Create new organization account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
