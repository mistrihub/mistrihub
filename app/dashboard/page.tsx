import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard-client";

export const metadata: Metadata = {
  title: "Worker Dashboard",
  description: "Create and manage your LocalPro worker profile."
};

export default function DashboardPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <DashboardClient />
    </section>
  );
}
