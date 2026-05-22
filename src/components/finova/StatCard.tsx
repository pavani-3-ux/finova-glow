import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/finova/store";

interface Props {
  label: string;
  value: number;
  currency?: string;
  delta?: number;
  icon: LucideIcon;
  accent?: "primary" | "accent" | "success" | "destructive" | "warning";
  delay?: number;
}

const accentMap: Record<string, string> = {
  primary: "from-primary/30 to-primary-glow/20 text-primary",
  accent: "from-accent/30 to-primary-glow/20 text-accent",
  success: "from-success/30 to-accent/20 text-success",
  destructive: "from-destructive/30 to-warning/20 text-destructive",
  warning: "from-warning/30 to-destructive/20 text-warning",
};

export function StatCard({ label, value, currency = "USD", delta, icon: Icon, accent = "primary", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current || !numRef.current) return;
    gsap.fromTo(
      ref.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, delay, ease: "power3.out" }
    );
    const obj = { v: 0 };
    gsap.to(obj, {
      v: value,
      duration: 1.4,
      delay: delay + 0.1,
      ease: "power2.out",
      onUpdate: () => {
        if (numRef.current) numRef.current.textContent = formatCurrency(obj.v, currency);
      },
    });
  }, [value, currency, delay]);

  return (
    <div
      ref={ref}
      className="glass rounded-2xl p-5 relative overflow-hidden hover:shadow-glow transition-all duration-500 hover:-translate-y-1 group"
    >
      <div className={`absolute -top-10 -right-10 size-32 rounded-full bg-gradient-to-br ${accentMap[accent]} blur-2xl opacity-50 group-hover:opacity-80 transition-opacity`} />
      <div className="relative flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        </div>
        <div className={`size-10 rounded-xl glass grid place-items-center ${accentMap[accent].split(" ").pop()}`}>
          <Icon className="size-5" />
        </div>
      </div>
      <span ref={numRef} className="relative text-3xl font-bold font-display tracking-tight">
        {formatCurrency(0, currency)}
      </span>
      {delta !== undefined && (
        <p className={`relative mt-2 text-xs ${delta >= 0 ? "text-success" : "text-destructive"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}% vs last month
        </p>
      )}
    </div>
  );
}