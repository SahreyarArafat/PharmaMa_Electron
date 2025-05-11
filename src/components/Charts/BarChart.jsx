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

export default function BarChartDemo() {
  const barData = [
    { name: "Jan", sales: 12 },
    { name: "Feb", sales: 19 },
    { name: "Mar", sales: 3 },
    { name: "Apr", sales: 5 },
    { name: "May", sales: 2 },
    { name: "Jun", sales: 3 },
  ];

  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56"];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={barData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="sales" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
