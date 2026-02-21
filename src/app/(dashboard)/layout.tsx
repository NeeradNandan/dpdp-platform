import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DashboardLayoutContent } from "./dashboard-layout-content";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardLayoutContent />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
