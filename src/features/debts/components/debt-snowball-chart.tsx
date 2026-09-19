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

interface DebtChartItem {
  name: string;
  "Monto Inicial": number;
  "Saldo Pendiente": number;
  "Total Pagado": number;
}

export function DebtSnowballChart({ data }: { data: DebtChartItem[] }) {
  if (data.length === 0) {
    return null;
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
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
          <Bar dataKey="Monto Inicial" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Saldo Pendiente" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Total Pagado" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
