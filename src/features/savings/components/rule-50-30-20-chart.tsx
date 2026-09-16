"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ChartItem {
  name: string;
  Ideal: number;
  Real: number;
}

export function Rule503020Chart({ data }: { data: ChartItem[] }) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={(val) => `$${val}`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(value: any) => [formatCurrency(Number(value)), ""]}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
          <Bar dataKey="Ideal" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Recomendado (Ideal)" />
          <Bar dataKey="Real" fill="#10b981" radius={[4, 4, 0, 0]} name="Gasto Real" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
