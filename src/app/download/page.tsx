"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import API_URL from "@/lib/api";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";

type DownloadRun = {
  id: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  name?: string;
  overallReportUrl?: string;
};

const toSameOriginApiUrl = (href: string) => {
  if (href.startsWith("/api/")) return href;
  try {
    const url = new URL(href);
    if (url.pathname.startsWith("/api/")) return `${url.pathname}${url.search}`;
  } catch {
    // ignore
  }
  return href;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const coerceRuns = (payload: unknown): DownloadRun[] => {
  if (Array.isArray(payload)) return payload as DownloadRun[];
  if (!isRecord(payload)) return [];

  const candidates: unknown[] = [
    payload.data,
    payload.rows,
    payload.result,
    payload.results,
    payload.items,
    payload.runs,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as DownloadRun[];
  }
  return [];
};

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};
  try {
    const token =
      localStorage.getItem("token") ??
      sessionStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;

    // Ensure new tabs can read the token.
    if (token && !localStorage.getItem("token")) {
      localStorage.setItem("token", token);
    }
  } catch {
    // ignore
  }
  return headers;
};

const getToken = () => {
  try {
    return localStorage.getItem("token") ?? sessionStorage.getItem("token");
  } catch {
    return null;
  }
};

const setTokenCookie = (token: string) => {
  // Used for new-tab navigation where Authorization headers cannot be set.
  const safeValue = encodeURIComponent(token);
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `token=${safeValue}; Path=/; SameSite=Lax${secure ? "; Secure" : ""}`;
};

const getFilenameFromContentDisposition = (contentDisposition: string | null) => {
  if (!contentDisposition) return null;
  const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(
    contentDisposition
  );
  const raw = match?.[1] ?? match?.[2];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

export default function DownloadPage() {
  const [runs, setRuns] = useState<DownloadRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRuns = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/download/runs`, {
          headers: {
            Accept: "application/json",
            ...getAuthHeaders(),
          },
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch runs (${res.status})`);
        }
        const json: unknown = await res.json();
        const nextRuns = coerceRuns(json);
        if (!cancelled) setRuns(nextRuns);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to fetch runs");
          setRuns([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRuns();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedRuns = useMemo(() => {
    const copy = [...runs];
    copy.sort((a, b) => {
      const ax = a.updatedAt ?? a.createdAt ?? "";
      const bx = b.updatedAt ?? b.createdAt ?? "";
      return bx.localeCompare(ax);
    });
    return copy;
  }, [runs]);

  const handleDownload = async (runId: string) => {
    setDownloadingId(runId);
    try {
      // Per your API: /runs/:runId/zip
      const primaryUrl = `${API_URL}/runs/${encodeURIComponent(runId)}/zip`;
      const fallbackUrl = `${API_URL}/api/download/runs/${encodeURIComponent(runId)}/zip`;

      const tryFetch = async (url: string) => {
        return fetch(url, {
          headers: {
            ...getAuthHeaders(),
          },
        });
      };

      let res = await tryFetch(primaryUrl);
      if (!res.ok) {
        res = await tryFetch(fallbackUrl);
      }
      if (!res.ok) {
        throw new Error(`Download failed (${res.status})`);
      }

      const blob = await res.blob();
      const filenameFromHeader = getFilenameFromContentDisposition(
        res.headers.get("content-disposition")
      );
      const filename = filenameFromHeader || `run-${runId}.zip`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success(`Downloaded: ${filename}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleViewReport = (run: DownloadRun) => {
    const token = getToken();

    if (token) {
      setTokenCookie(token);
    } else {
      toast.error("Authentication token not found.");
      return;
    }

    const fileName = "overall_report/overall_wgs_cluster_summary_report.html";
    const url = `${API_URL}/api/download/runs/${run.id}/report/cluster-view/${fileName}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-slate-900">Download</h1>

      <Card className="w-full max-w-6xl mx-auto shadow-lg border-slate-200">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-xl">Runs</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <div className="text-sm text-red-600 mb-3">Error: {error}</div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200">
                  <th className="py-3 pr-4 font-semibold text-slate-700">Run ID</th>
                  <th className="py-3 pr-4 font-semibold text-slate-700">Status</th>
                  <th className="py-3 pr-4 font-semibold text-slate-700">Updated</th>
                  <th className="py-3 pr-0 font-semibold text-slate-700 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className="py-3 pr-4 text-slate-600" colSpan={4}>
                      Loading...
                    </td>
                  </tr>
                )}

                {!loading && sortedRuns.length === 0 && (
                  <tr>
                    <td className="py-3 pr-4 text-slate-600" colSpan={4}>
                      No runs found.
                    </td>
                  </tr>
                )}

                {!loading &&
                  sortedRuns.map((run) => {
                    const updated = run.updatedAt ?? run.createdAt ?? "";
                    const hasReport = Boolean(run.overallReportUrl);
                    return (
                      <tr key={run.id} className="border-b border-slate-100">
                        <td className="py-3 pr-4 text-slate-900">
                          {run.name ? `${run.name} (${run.id})` : run.id}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {run.status || "—"}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">{updated || "—"}</td>
                        <td className="py-3 pr-0 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewReport(run)}
                              disabled={!hasReport}
                            >
                              View report
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleDownload(run.id)}
                              disabled={downloadingId === run.id}
                            >
                              {downloadingId === run.id ? "Downloading..." : "Download"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
