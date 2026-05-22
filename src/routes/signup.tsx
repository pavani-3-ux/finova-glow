import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Sparkles, User, Mail, Lock } from "lucide-react";
import { auth } from "@/lib/finova/store";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Sign up — Finova" }] }),
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) gsap.fromTo(cardRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    auth.signup(name || "Trader", email, password);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 relative overflow-hidden">
      <div className="absolute size-96 rounded-full bg-accent/30 blur-3xl top-10 -right-20 animate-float" />
      <div className="absolute size-96 rounded-full bg-primary/30 blur-3xl bottom-10 -left-20 animate-float" style={{ animationDelay: "2s" }} />
      <div ref={cardRef} className="glass-strong rounded-3xl p-8 w-full max-w-md relative shadow-elegant">
        <div className="flex items-center gap-2 mb-8">
          <div className="size-12 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="size-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Finova</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Wealth OS</p>
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-2">Create account</h2>
        <p className="text-muted-foreground text-sm mb-6">Start tracking your wealth in under a minute.</p>
        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <User className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name"
              className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="relative">
            <Mail className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email"
              className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="relative">
            <Lock className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password"
              className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <button type="submit" className="w-full bg-gradient-primary text-primary-foreground py-3 rounded-xl font-semibold shadow-glow hover:scale-[1.02] transition-transform">
            Create Account
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}