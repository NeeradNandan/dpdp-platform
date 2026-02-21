"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/consent": "Consent Manager",
  "/data-mapping": "Data Mapping",
  "/grievances": "Grievances",
  "/settings": "Settings",
};

function getTitleFromPath(pathname: string): string {
  return routeTitles[pathname] ?? "Dashboard";
}

export function DashboardLayoutContent() {
  const pathname = usePathname();
  const title = getTitleFromPath(pathname);

  return <Header title={title} />;
}
