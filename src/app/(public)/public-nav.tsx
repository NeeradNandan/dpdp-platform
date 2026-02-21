"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicNav() {
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-semibold text-slate-900"
        >
          <Shield className="h-7 w-7 text-indigo-600" />
          Yojak
        </Link>
        <nav className="flex items-center gap-6">
          <div className="relative">
            <button
              type="button"
              onClick={() => setToolsOpen(!toolsOpen)}
              onBlur={() => setTimeout(() => setToolsOpen(false), 150)}
              className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Tools
              <ChevronDown
                className={`h-4 w-4 transition-transform ${toolsOpen ? "rotate-180" : ""}`}
              />
            </button>
            {toolsOpen && (
              <div className="absolute left-0 top-full mt-1 w-56 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                <Link
                  href="/tools/policy-generator"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setToolsOpen(false)}
                >
                  Policy Generator
                </Link>
                <Link
                  href="/tools/cookie-scanner"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setToolsOpen(false)}
                >
                  Cookie Scanner
                </Link>
                <Link
                  href="/tools/readiness-score"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setToolsOpen(false)}
                >
                  Readiness Score
                </Link>
              </div>
            )}
          </div>
          <Link
            href="/#pricing"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Login
          </Link>
          <Link href="/signup">
            <Button size="default">Start Free Trial</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
