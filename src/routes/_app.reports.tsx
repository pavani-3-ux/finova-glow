import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, FileText, FileSpreadsheet, Filter } from "lucide-react";
import jsPDF from "jspdf";
import { MonthlyBar, ExpensePie, TrendArea } from "@/components/finova/Charts";
import { useFinovaData } from "@/lib/finova/useStore";
import { formatCurrency } from "@/lib/finova/store";

export const Route = createFileRoute("/_app/reports")({
  component: Reports,
  head: () => ({ meta: [{ title: "Reports — Finova" }] }),
});

function Reports() {
  const { transactions, profile } = useFinovaData();
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const filtered = useMemo(
    () => (filter === "all" ? transactions : transactions.filter((t) => t.type === filter)),
    [transactions, filter]
  );

  const exportCSV = () => {
    const rows = [
      ["Date", "Type", "Category", "Description", "Amount"],
      ...filtered.map((t) => [t.date, t.type, t.category, t.description, t.amount.toString()]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "finova-transactions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.text("Finova — Transaction Report", 14, 20);
    doc.setFontSize(10); doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    let y = 40;
    doc.setFontSize(11);
    doc.text("Date          Type      Category       Description           Amount", 14, y);
    y += 6;
    filtered.slice(0, 40).forEach((t) => {
      const line = `${new Date(t.date).toLocaleDateString().padEnd(12)}  ${t.type.padEnd(8)}  ${t.category.padEnd(13)}  ${t.description.substring(0, 20).padEnd(20)}  ${formatCurrency(t.amount, profile.currency)}`;
      doc.text(line, 14, y);
      y += 6;
      if (y > 280) { doc.addPage(); y = 20; }
    });
    doc.save("finova-report.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Visualize and export your financial activity.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="glass px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-glow transition-all">
            <FileSpreadsheet className="size-4" /> CSV
          </button>
          <button onClick={exportPDF} className="bg-gradient-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-glow">
            <FileText className="size-4" /> PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-4">Balance Trend</h3>
          <TrendArea transactions={transactions} />
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-4">Income vs Expense</h3>
          <MonthlyBar transactions={transactions} />
        </div>
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">Expense Categories</h3>
          <ExpensePie transactions={transactions} />
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-semibold flex items-center gap-2"><Filter className="size-4" /> All Transactions</h3>
          <div className="flex gap-2">
            {(["all", "income", "expense"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === f ? "bg-gradient-primary text-primary-foreground" : "glass text-muted-foreground"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-left text-xs uppercase tracking-wider">
                <th className="py-3">Date</th>
                <th className="py-3">Description</th>
                <th className="py-3">Category</th>
                <th className="py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-t border-border hover:bg-white/5">
                  <td className="py-3 text-muted-foreground">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="py-3">{t.description}</td>
                  <td className="py-3"><span className="px-2 py-1 rounded-md text-xs glass">{t.category}</span></td>
                  <td className={`py-3 text-right font-semibold ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                    {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount, profile.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}