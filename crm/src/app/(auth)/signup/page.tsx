"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          />
          <Input
            placeholder="Organization name"
            value={form.organizationName}
            onChange={(e) => setForm((s) => ({ ...s, organizationName: e.target.value }))}
          />
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
              setError("");

              const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
              });

              if (!res.ok) {
                const json = await res.json();
                setError(json.message || "Failed to sign up");
              } else {
                router.push("/login");
              }

              setLoading(false);
            }}
          >
            {loading ? "Creating..." : "Create Account"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => router.push("/login")}>
            Back to login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


