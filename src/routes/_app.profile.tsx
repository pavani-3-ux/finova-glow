import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Mail, User as UserIcon, Edit2 } from "lucide-react";
import { useFinovaData } from "@/lib/finova/useStore";
import { store, formatCurrency } from "@/lib/finova/store";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile — Finova" }] }),
});

function ProfilePage() {
  const { profile, transactions, refresh } = useFinovaData();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  useEffect(() => { setDraft(profile); }, [profile.name, profile.bio]);

  const stats = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, count: transactions.length, balance: income - expense };
  }, [transactions]);

  const save = () => { store.setProfile(draft); setEditing(false); refresh(); };

  const initials = (draft.name || "U").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10" />
        <div className="absolute -top-20 -right-20 size-64 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="size-24 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow text-3xl font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-2">
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-full glass rounded-xl px-3 py-2 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <textarea value={draft.bio || ""} onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                  rows={2} placeholder="Bio"
                  className="w-full glass rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            ) : (
              <>
                <h1 className="text-3xl md:text-4xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
                  <Mail className="size-4" /> {profile.email}
                </p>
                {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}
              </>
            )}
          </div>
          {editing ? (
            <div className="flex gap-2">
              <button onClick={() => { setEditing(false); setDraft(profile); }} className="glass px-4 py-2 rounded-xl text-sm">Cancel</button>
              <button onClick={save} className="bg-gradient-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold shadow-glow">Save</button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="glass px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:shadow-glow transition-all">
              <Edit2 className="size-4" /> Edit
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ProfileStat label="Balance" value={formatCurrency(stats.balance, profile.currency)} />
        <ProfileStat label="Income" value={formatCurrency(stats.income, profile.currency)} />
        <ProfileStat label="Expenses" value={formatCurrency(stats.expense, profile.currency)} />
        <ProfileStat label="Transactions" value={stats.count.toString()} />
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><UserIcon className="size-4" /> Account</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Row k="Name" v={profile.name} />
          <Row k="Email" v={profile.email} />
          <Row k="Currency" v={profile.currency} />
          <Row k="Notifications" v={profile.notifications ? "Enabled" : "Disabled"} />
        </dl>
      </div>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-xl font-bold mt-1 truncate">{value}</p>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between glass rounded-xl px-4 py-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}