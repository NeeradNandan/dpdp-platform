import Link from "next/link";
import { Shield } from "lucide-react";
import { PublicNav } from "./public-nav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <PublicNav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-indigo-400" />
              <span className="text-lg font-semibold text-white">
                Yojak
              </span>
            </div>
            <p className="text-center text-sm text-slate-400 md:text-left">
              Compliance, Connected. Automated DPDP Act compliance for Indian
              businesses.
            </p>
            <div className="flex gap-6">
              <Link
                href="/login"
                className="text-sm text-slate-400 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm text-slate-400 hover:text-white"
              >
                Get Started
              </Link>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Yojak. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
