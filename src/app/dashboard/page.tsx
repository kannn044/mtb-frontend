"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from "recharts";
import { useEffect, useState } from "react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

interface RawClusterData {
  patient_id: string;
  sample_id: string;
  collection_date: string;
  district: string;
  province: string;
  age: string;
  chest_x_ray: string;
  coverage: string;
  education: string;
  ethnic_group: string;
  lineage: string;
  major_lineage: string;
  mean_base_qual: string;
  mean_depth: string;
  mean_mapping_qual: string;
  number_of_SNPs_supporting_lineage_assignment: string;
  number_of_bases_covered: string;
  number_of_reads: string;
  occupation: string;
  overall_DR_genotype: string;
  seq_id: string;
  sex: string;
  treatment_outcome: string;
}

interface RecentCluster {
  id: string;
  risk: string;
  status: string;
  assignedTo: string;
}

interface TransformedData {
  totalClusters: number;
  riskLevelSummary: {
    title: string;
    value: number;
  }[];
  recentClusters: RecentCluster[];
  clusterDistribution: {
    risk: string;
    count: number;
  }[];
  lineageDistribution: {
    name: string;
    value: number;
  }[];
  provinceDistribution: {
    name: string;
    value: number;
  }[];
  scatterPlotData: {
    coverage: number;
    mean_depth: number;
  }[];
}

const NUM_RECENT_CLUSTERS = 5;

const transformBackendData = (
  rawData: RawClusterData[]
): TransformedData => {
  const totalClusters = rawData.length;

  // Calculate summary of risk levels
  const riskLevelMap = rawData.reduce((acc, curr) => {
    const risk = curr.overall_DR_genotype || "Unknown";
    acc[risk] = (acc[risk] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Format for summary cards
  const riskLevelSummary = Object.entries(riskLevelMap).map(
    ([title, value]) => ({
      title,
      value,
    })
  );

  // Format for cluster distribution chart
  const clusterDistribution = Object.entries(riskLevelMap).map(
    ([risk, count]) => ({
      risk,
      count,
    })
  );

  // Calculate lineage distribution
  const lineageDistributionMap = rawData.reduce((acc, curr) => {
    const lineage = curr.major_lineage || "Unknown";
    acc[lineage] = (acc[lineage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const lineageDistribution = Object.entries(lineageDistributionMap).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  // Calculate province distribution
  const provinceDistributionMap = rawData.reduce((acc, curr) => {
    const province = curr.province || "Unknown";
    acc[province] = (acc[province] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const provinceDistribution = Object.entries(provinceDistributionMap).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  // Prepare data for scatter plot
  const scatterPlotData = rawData.map((item) => ({
    coverage: parseFloat(item.coverage),
    mean_depth: parseFloat(item.mean_depth),
  }));

  // Get a few recent clusters for the table
  const recentClusters: RecentCluster[] = rawData
    .slice(0, NUM_RECENT_CLUSTERS)
    .map((item) => ({
      id: item.sample_id,
      risk: item.overall_DR_genotype || "Unknown",
      status: item.major_lineage || "Unknown",
      assignedTo: "N/A", // Not available in the provided data
    }));

  return {
    totalClusters,
    riskLevelSummary,
    recentClusters,
    clusterDistribution,
    lineageDistribution,
    provinceDistribution,
    scatterPlotData,
  };
};

export default function DashboardPage() {
  const [data, setData] = useState<TransformedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/csv");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result: RawClusterData[] = await response.json();
        const transformed = transformBackendData(result);
        setData(transformed);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">MTB Cluster Dashboard</h1>

      {loading && <div>Loading...</div>}
      {!loading && !data && <div>No data available</div>}

      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Total Clusters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.totalClusters.toString()}
                </div>
              </CardContent>
            </Card>
            {data.riskLevelSummary && data.riskLevelSummary.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Clusters</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cluster ID</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentClusters.map((cluster) => (
                      <TableRow key={cluster.id}>
                        <TableCell>{cluster.id}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              cluster.risk === "HR-TB" || cluster.risk === "MDR-TB"
                                ? "destructive"
                                : cluster.risk === "Pre-XDR-TB"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {cluster.risk}
                          </Badge>
                        </TableCell>
                        <TableCell>{cluster.status}</TableCell>
                        <TableCell>{cluster.assignedTo}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cluster Distribution by Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={data.clusterDistribution.map((item) => ({
                      name: item.risk,
                      value: item.count,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Lineage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.lineageDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label
                    >
                      {data.lineageDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Province Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={data.provinceDistribution}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Coverage vs. Mean Depth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid />
                    <XAxis type="number" dataKey="coverage" name="Coverage" unit="%" />
                    <YAxis
                      type="number"
                      dataKey="mean_depth"
                      name="Mean Depth"
                    />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Legend />
                    <Scatter
                      name="Samples"
                      data={data.scatterPlotData}
                      fill="#8884d8"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}