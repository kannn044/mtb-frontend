"use client";

import { Button } from "@/components/ui/button";
import API_URL from "@/lib/api";

export default function ClusterDashboardPage() {
  const handleViewReport = () => {

    const fileName = "overall_report/overall_wgs_cluster_summary_report.html";
    const url = `${API_URL}/api/dashboard/report/cluster-view/${fileName}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold text-gray-900">
          MTB Cluster Dashboard
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          This page will host the cluster-level dashboard view.
        </p>
        <div className="mt-6">
          <Button onClick={handleViewReport}>View Cluster Report</Button>
        </div>
      </div>
    </main>
  );
}
