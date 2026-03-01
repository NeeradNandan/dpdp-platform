"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface SignupResponse {
  message?: string;
  autoConfirmed?: boolean;
  userId?: string;
  error?: string;
}

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "E-commerce",
  "Education",
  "Manufacturing",
  "Other",
] as const;

const ORG_SIZES = ["Micro", "Small", "Medium", "Large"] as const;

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    organizationName: "",
    gstin: "",
    email: "",
    password: "",
    confirmPassword: "",
    industry: "",
    orgSize: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function validateForm(): string | null {
    if (!formData.organizationName.trim()) {
      return "Organization name is required.";
    }
    if (!formData.email.trim()) {
      return "Email is required.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address.";
    }
    if (formData.password.length < 6) {
      return "Password must be at least 6 characters.";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }
    if (!formData.industry) {
      return "Please select an industry.";
    }
    if (!formData.orgSize) {
      return "Please select organization size.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          organizationName: formData.organizationName,
          gstin: formData.gstin || null,
          industry: formData.industry,
          orgSize: formData.orgSize,
        }),
      });

      let data: SignupResponse;
      try {
        data = await res.json();
      } catch {
        setError("Unable to reach the server. Please check your connection and try again.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Sign up failed. Please try again.");
        setLoading(false);
        return;
      }

      if (data.autoConfirmed) {
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          router.push("/login?message=Account created. Please sign in.");
          return;
        }

        router.push("/dashboard");
        router.refresh();
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again in a moment.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Shield className="h-7 w-7 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We sent a confirmation link to <strong>{formData.email}</strong>.
            Click the link to activate your account, then sign in.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-4">
          <Button
            className="w-full"
            variant="default"
            onClick={() => router.push("/login")}
          >
            Go to Sign In
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
          <Shield className="h-7 w-7 text-indigo-600" />
        </div>
        <CardTitle className="text-2xl">Yojak</CardTitle>
        <CardDescription>Create your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}
          <Input
            label="Organization Name"
            name="organizationName"
            type="text"
            placeholder="Acme Pvt Ltd"
            value={formData.organizationName}
            onChange={handleChange}
            required
          />
          <Input
            label="GSTIN"
            name="gstin"
            type="text"
            placeholder="22AAAAA0000A1Z5"
            value={formData.gstin}
            onChange={handleChange}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@company.com"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
          <div>
            <label
              htmlFor="industry"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Industry
            </label>
            <select
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              required
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Organization Size
            </span>
            <div className="flex flex-wrap gap-4">
              {ORG_SIZES.map((size) => (
                <label
                  key={size}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="radio"
                    name="orgSize"
                    value={size}
                    checked={formData.orgSize === size}
                    onChange={handleChange}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{size}</span>
                </label>
              ))}
            </div>
          </div>
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            error={
              formData.confirmPassword &&
              formData.password !== formData.confirmPassword
                ? "Passwords do not match"
                : undefined
            }
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            variant="default"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>
          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
