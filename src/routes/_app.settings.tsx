import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bell, Globe, Wallet, ArrowRightLeft } from "lucide-react";
import { useFinovaData } from "@/lib/finova/useStore";
import { store, EXPENSE_CATEGORIES, type Budget } from "@/lib/finova/store";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — Finova" }] }),
});

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR", "CAD", "AUD", "BTC"];
const RATES: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 156, INR: 83, CAD: 1.37, AUD: 1.51, BTC: 0.000015 };

function SettingsPage() {
  const { profile, budgets, refresh } = useFinovaData();
  const [draft, setDraft] = useState(profile);
  const [budgetDraft, setBudgetDraft] = useState<Budget[]>(budgets);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [amount, setAmount] = useState("100");

  useEffect(() => { setDraft(profile); }, [profile.name, profile.email, profile.currency, profile.notifications]);
  useEffect(() => { setBudgetDraft(budgets); }, [budgets.length]);

  const save = () => { store.setProfile(draft); store.setBudgets(budgetDraft); refresh(); };

  const conv = (parseFloat(amount) || 0) * (RATES[to] / RATES[from]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Personalize your Finova experience.</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="size-5 text-primary" />
          <h3 className="font-semibold">Preferences</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Currency">
            <select value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value })}
              className="w-full glass rounded-xl px-4 py-3 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/50">
              {CURRENCIES.map((c) => <option key={c} value={c} className="bg-card">{c}</option>)}
            </select>
          </Field>
          <Field label="Email">
            <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              className="w-full glass rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </Field>
        </div>
        <label className="flex items-center justify-between mt-4 glass rounded-xl px-4 py-3 cursor-pointer">
          <span className="flex items-center gap-2 text-sm"><Bell className="size-4" /> Notifications</span>
          <input type="checkbox" checked={draft.notifications}
            onChange={(e) => setDraft({ ...draft, notifications: e.target.checked })}
            className="size-5 accent-primary" />
        </label>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="size-5 text-primary" />
          <h3 className="font-semibold">Budget Planning</h3>
        </div>
        <div className="space-y-2">
          {EXPENSE_CATEGORIES.map((cat) => {
            const b = budgetDraft.find((x) => x.category === cat);
            const value = b?.limit ?? 0;
            return (
              <div key={cat} className="flex items-center gap-3 glass rounded-xl p-3">
                <span className="text-sm font-medium w-32">{cat}</span>
                <input type="number" value={value}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    const next = budgetDraft.filter((x) => x.category !== cat);
                    if (v > 0) next.push({ category: cat, limit: v });
                    setBudgetDraft(next);
                  }}
                  className="flex-1 bg-transparent text-sm focus:outline-none text-right pr-2" />
                <span className="text-xs text-muted-foreground">{draft.currency}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <ArrowRightLeft className="size-5 text-primary" />
          <h3 className="font-semibold">Currency Converter</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <Field label="Amount">
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full glass rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </Field>
          <Field label="From">
            <select value={from} onChange={(e) => setFrom(e.target.value)}
              className="w-full glass rounded-xl px-4 py-3 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/50">
              {CURRENCIES.map((c) => <option key={c} value={c} className="bg-card">{c}</option>)}
            </select>
          </Field>
          <Field label="To">
            <select value={to} onChange={(e) => setTo(e.target.value)}
              className="w-full glass rounded-xl px-4 py-3 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/50">
              {CURRENCIES.map((c) => <option key={c} value={c} className="bg-card">{c}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-4 glass rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">{amount} {from} =</p>
          <p className="text-3xl font-bold text-gradient mt-1">{conv.toFixed(4)} {to}</p>
        </div>
      </div>

      <button onClick={save} className="bg-gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-glow hover:scale-105 transition-transform">
        Save Changes
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}