export type TxType = "income" | "expense";
export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO
}
export interface Budget {
  category: string;
  limit: number;
}
export interface UserProfile {
  name: string;
  email: string;
  currency: string;
  avatar?: string;
  notifications: boolean;
  bio?: string;
}

const KEY_USER = "finova:user";
const KEY_AUTH = "finova:auth";
const KEY_TX = "finova:tx";
const KEY_BUDGETS = "finova:budgets";
const KEY_PROFILE = "finova:profile";

export const EXPENSE_CATEGORIES = [
  "Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Travel", "Other",
];
export const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Gift", "Other"];

const seedTransactions = (): Transaction[] => {
  const now = new Date();
  const items: Omit<Transaction, "id" | "date">[] = [
    { type: "income", amount: 5200, category: "Salary", description: "Monthly salary" },
    { type: "income", amount: 850, category: "Freelance", description: "Design project" },
    { type: "expense", amount: 1200, category: "Bills", description: "Rent" },
    { type: "expense", amount: 320, category: "Food", description: "Groceries" },
    { type: "expense", amount: 89, category: "Entertainment", description: "Netflix + Spotify" },
    { type: "expense", amount: 145, category: "Transport", description: "Fuel" },
    { type: "expense", amount: 230, category: "Shopping", description: "New headphones" },
    { type: "expense", amount: 65, category: "Health", description: "Pharmacy" },
    { type: "income", amount: 320, category: "Investment", description: "Dividend" },
    { type: "expense", amount: 480, category: "Travel", description: "Weekend trip" },
  ];
  return items.map((it, i) => ({
    ...it,
    id: crypto.randomUUID(),
    date: new Date(now.getFullYear(), now.getMonth(), Math.max(1, 28 - i * 2)).toISOString(),
  }));
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("finova:update"));
}

export const auth = {
  isAuthed: () => read<boolean>(KEY_AUTH, false),
  signup: (name: string, email: string, _password: string) => {
    const profile: UserProfile = {
      name, email, currency: "USD", notifications: true, bio: "Crafting my financial future.",
    };
    write(KEY_USER, { email });
    write(KEY_PROFILE, profile);
    write(KEY_AUTH, true);
    if (!localStorage.getItem(KEY_TX)) write(KEY_TX, seedTransactions());
    if (!localStorage.getItem(KEY_BUDGETS)) {
      write<Budget[]>(KEY_BUDGETS, [
        { category: "Food", limit: 500 },
        { category: "Transport", limit: 250 },
        { category: "Entertainment", limit: 150 },
        { category: "Shopping", limit: 400 },
      ]);
    }
  },
  login: (email: string, _password: string) => {
    write(KEY_USER, { email });
    write(KEY_AUTH, true);
    if (!localStorage.getItem(KEY_PROFILE)) {
      write<UserProfile>(KEY_PROFILE, {
        name: email.split("@")[0], email, currency: "USD", notifications: true, bio: "",
      });
    }
    if (!localStorage.getItem(KEY_TX)) write(KEY_TX, seedTransactions());
  },
  logout: () => write(KEY_AUTH, false),
};

export const store = {
  getProfile: (): UserProfile =>
    read<UserProfile>(KEY_PROFILE, {
      name: "Guest", email: "guest@finova.app", currency: "USD", notifications: true, bio: "",
    }),
  setProfile: (p: UserProfile) => write(KEY_PROFILE, p),
  getTransactions: (): Transaction[] => read<Transaction[]>(KEY_TX, []),
  addTransaction: (t: Omit<Transaction, "id">) => {
    const all = store.getTransactions();
    all.unshift({ ...t, id: crypto.randomUUID() });
    write(KEY_TX, all);
  },
  removeTransaction: (id: string) => {
    write(KEY_TX, store.getTransactions().filter((t) => t.id !== id));
  },
  getBudgets: (): Budget[] => read<Budget[]>(KEY_BUDGETS, []),
  setBudgets: (b: Budget[]) => write(KEY_BUDGETS, b),
};

export function formatCurrency(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `$${amount.toFixed(0)}`;
  }
}

export function useFinovaSync() {
  // hook helper to trigger re-render via subscription
  return null;
}