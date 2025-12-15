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
} from "recharts";

const summaryData = [
  { title: "Total Clusters", value: "1,254" },
  { title: "New Clusters (24h)", value: "12" },
  { title: "Pending Analysis", value: "87" },
  { title: "Resolved Clusters", value: "1,155" },
];

const recentClusters = [
  {
    id: "CL-001254",
    date: "2023-10-27",
    risk: "High",
    status: "Pending",
    assignedTo: "Dr. Smith",
  },
  {
    id: "CL-001253",
    date: "2023-10-27",
    risk: "Medium",
    status: "In Progress",
    assignedTo: "Dr. Jones",
  },
  {
    id: "CL-001252",
    date: "2023-10-26",
    risk: "Low",
    status: "Resolved",
    assignedTo: "Dr. Doe",
  },
  {
    id: "CL-001251",
    date: "2023-10-26",
    risk: "High",
    status: "Pending",
    assignedTo: "Dr. Smith",
  },
];

const clusterDistribution = [
  { name: "Low", value: 600 },
  { name: "Medium", value: 454 },
  { name: "High", value: 200 },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">MTB Cluster Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {summaryData.map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
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
                  <TableHead>Date Detected</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentClusters.map((cluster) => (
                  <TableRow key={cluster.id}>
                    <TableCell>{cluster.id}</TableCell>
                    <TableCell>{cluster.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          cluster.risk === "High"
                            ? "destructive"
                            : cluster.risk === "Medium"
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
              <BarChart data={clusterDistribution}>
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
    </div>
  );
}