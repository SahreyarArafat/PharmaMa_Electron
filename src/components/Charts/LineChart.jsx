import React from "react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function LineChartDemo() {
  const lineData = [
    { name: "Week 1", revenue: 15 },
    { name: "Week 2", revenue: 25 },
    { name: "Week 3", revenue: 30 },
    { name: "Week 4", revenue: 10 },
  ];

  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={lineData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
}
