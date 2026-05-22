import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from "recharts";
import type { Transaction } from "@/lib/finova/store";

const COLORS = ["#a78bfa", "#22d3ee", "#34d399", "#fbbf24", "#fb7185", "#818cf8", "#f472b6", "#60a5fa"];

export function ExpensePie({ transactions }: { transactions: Transaction[] }) {
  const data = Object.entries(
    transactions.filter((t) => t.type === "expense").reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  if (!data.length) return <EmptyChart label="No expenses yet" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3} stroke="none">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip
          contentStyle={{ background: "rgba(20,20,40,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MonthlyBar({ transactions }: { transactions: Transaction[] }) {
  const months: Record<string, { name: string; income: number; expense: number }> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    months[key] = { name: d.toLocaleString("en", { month: "short" }), income: 0, expense: 0 };
  }
  transactions.forEach((t) => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (months[key]) months[key][t.type] += t.amount;
  });
  const data = Object.values(months);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
        <YAxis stroke="rgba(255,255,255,0.5)" />
        <Tooltip contentStyle={{ background: "rgba(20,20,40,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
        <Bar dataKey="income" fill="#22d3ee" radius={[8, 8, 0, 0]} />
        <Bar dataKey="expense" fill="#a78bfa" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendArea({ transactions }: { transactions: Transaction[] }) {
  const days: Record<string, { name: string; balance: number }> = {};
  const sorted = [...transactions].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  let running = 0;
  sorted.forEach((t) => {
    running += t.type === "income" ? t.amount : -t.amount;
    const key = new Date(t.date).toLocaleDateString("en", { month: "short", day: "numeric" });
    days[key] = { name: key, balance: running };
  });
  const data = Object.values(days);
  if (!data.length) return <EmptyChart label="No trend data" />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
        <YAxis stroke="rgba(255,255,255,0.5)" />
        <Tooltip contentStyle={{ background: "rgba(20,20,40,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
        <Area type="monotone" dataKey="balance" stroke="#a78bfa" strokeWidth={2} fill="url(#g1)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function EmptyChart({ label }: { label: string }) {
  return <div className="h-[280px] grid place-items-center text-muted-foreground text-sm">{label}</div>;
}