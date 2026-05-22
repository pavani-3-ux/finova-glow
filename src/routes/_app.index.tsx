import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { Wallet, TrendingDown, TrendingUp, PiggyBank, Sparkles, Bell, Plus, Search } from "lucide-react";
import { StatCard } from "@/components/finova/StatCard";
import { ExpensePie, MonthlyBar } from "@/components/finova/Charts";
import { useFinovaData } from "@/lib/finova/useStore";
import { store, EXPENSE_CATEGORIES, INCOME_CATEGORIES, formatCurrency } from "@/lib/finova/store";

export const Route = createFileRoute("/_app/")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Finova" }] }),
});

function Dashboard() {
  const { transactions, profile, refresh } = useFinovaData();
  const headerRef = useRef<HTMLDivElement>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense, savings: Math.max(0, income - expense) };
  }, [transactions]);

  const insight = useMemo(() => buildInsight(transactions), [transactions]);

  const filtered = useMemo(
    () =>
      transactions.filter(
        (t) =>
          t.description.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase())
      ),
    [transactions, search]
  );

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
    }
  }, []);

  return (
    <div className="space-y-6">
      <div ref={headerRef} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-3xl md:text-4xl font-bold">
            Hello <span className="text-gradient">{profile.name}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="glass size-10 rounded-xl grid place-items-center hover:shadow-glow transition-all" aria-label="Notifications">
            <Bell className="size-4" />
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-gradient-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-glow hover:scale-105 transition-transform"
          >
            <Plus className="size-4" /> Add Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Balance" value={totals.balance} currency={profile.currency} delta={8.4} icon={Wallet} accent="primary" delay={0} />
        <StatCard label="Income" value={totals.income} currency={profile.currency} delta={12.1} icon={TrendingUp} accent="success" delay={0.1} />
        <StatCard label="Expenses" value={totals.expense} currency={profile.currency} delta={-4.2} icon={TrendingDown} accent="destructive" delay={0.2} />
        <StatCard label="Savings" value={totals.savings} currency={profile.currency} delta={5.6} icon={PiggyBank} accent="accent" delay={0.3} />
      </div>

      <div className="glass rounded-2xl p-5 flex items-start gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10" />
        <div className="relative size-12 rounded-xl bg-gradient-primary grid place-items-center shadow-glow animate-glow shrink-0">
          <Sparkles className="size-6 text-primary-foreground" />
        </div>
        <div className="relative">
          <p className="text-xs uppercase tracking-widest text-primary mb-1">AI Insight</p>
          <p className="text-sm md:text-base">{insight}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Monthly Analytics</h3>
            <span className="text-xs text-muted-foreground">Last 6 months</span>
          </div>
          <MonthlyBar transactions={transactions} />
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-4">Expense Breakdown</h3>
          <ExpensePie transactions={transactions} />
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-semibold">Recent Transactions</h3>
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="glass rounded-xl pl-9 pr-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-left text-xs uppercase tracking-wider">
                <th className="py-3">Description</th>
                <th className="py-3">Category</th>
                <th className="py-3">Date</th>
                <th className="py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 10).map((t) => (
                <tr key={t.id} className="border-t border-border hover:bg-white/5 transition-colors">
                  <td className="py-3">
                    <button
                      onClick={() => { store.removeTransaction(t.id); refresh(); }}
                      className="font-medium hover:text-destructive transition-colors text-left"
                      title="Click to delete"
                    >
                      {t.description}
                    </button>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded-md text-xs glass">{t.category}</span>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(t.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </td>
                  <td className={`py-3 text-right font-semibold ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                    {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount, profile.currency)}
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddTxModal onClose={() => { setShowAdd(false); refresh(); }} />}
    </div>
  );
}

function buildInsight(tx: ReturnType<typeof useFinovaData>["transactions"]) {
  if (!tx.length) return "Add your first transaction to unlock personalized insights.";
  const byCat: Record<string, number> = {};
  tx.filter((t) => t.type === "expense").forEach((t) => {
    byCat[t.category] = (byCat[t.category] || 0) + t.amount;
  });
  const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  const income = tx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = tx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const rate = income ? ((income - expense) / income) * 100 : 0;
  if (rate < 10)
    return `Your savings rate is only ${rate.toFixed(0)}%. ${top ? `${top[0]} is your largest expense — consider trimming it by 15% next month.` : ""}`;
  return `Great work — you're saving ${rate.toFixed(0)}% of your income. ${top ? `${top[0]} remains your top category at ${formatCurrency(top[1])}.` : ""}`;
}

function AddTxModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) gsap.fromTo(ref.current, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.5)" });
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    store.addTransaction({ type, amount: parseFloat(amount), category, description, date: new Date().toISOString() });
    onClose();
  };

  const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center p-4 z-50" onClick={onClose}>
      <div ref={ref} className="glass-strong rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4">New Transaction</h3>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); setCategory(t === "income" ? "Salary" : "Food"); }}
                className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                  type === t ? "bg-gradient-primary text-primary-foreground shadow-glow" : "glass text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full glass rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-full glass rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <select
            value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full glass rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-card"
          >
            {cats.map((c) => <option key={c} value={c} className="bg-card">{c}</option>)}
          </select>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl glass text-sm font-semibold">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-glow">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
}