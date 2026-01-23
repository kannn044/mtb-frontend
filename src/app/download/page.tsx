"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const MOCK_DOWNLOAD_FILES = [
  {
    id: "clusters_csv",
    name: "MTB cluster summary",
    format: "CSV",
    lastUpdated: "2026-01-23",
  },
  {
    id: "samples_csv",
    name: "Sample metadata export",
    format: "CSV",
    lastUpdated: "2026-01-23",
  },
  {
    id: "reports_zip",
    name: "Analysis reports bundle",
    format: "ZIP",
    lastUpdated: "2026-01-23",
  },
];

export default function DownloadPage() {
  const handleMockDownload = (fileId: string) => {
    const file = MOCK_DOWNLOAD_FILES.find((f) => f.id === fileId);
    toast.success(`Mock download started${file ? `: ${file.name}` : ""}`);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-slate-900">Download</h1>

      <Card className="w-full max-w-6xl mx-auto shadow-lg border-slate-200">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-xl">Available files</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200">
                  <th className="py-3 pr-4 font-semibold text-slate-700">File</th>
                  <th className="py-3 pr-4 font-semibold text-slate-700">Format</th>
                  <th className="py-3 pr-4 font-semibold text-slate-700">Last updated</th>
                  <th className="py-3 pr-0 font-semibold text-slate-700 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DOWNLOAD_FILES.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 text-slate-900">{f.name}</td>
                    <td className="py-3 pr-4 text-slate-600">{f.format}</td>
                    <td className="py-3 pr-4 text-slate-600">{f.lastUpdated}</td>
                    <td className="py-3 pr-0 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 h-9 px-4 transition-colors cursor-pointer shadow-sm"
                        onClick={() => handleMockDownload(f.id)}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Mock UI only: wire to backend download endpoints later.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
