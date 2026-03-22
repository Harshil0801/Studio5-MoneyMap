export const KB = [
  {
    id: "dashboard",
    title: "Overview / Dashboard",
    keywords: ["overview", "dashboard", "summary", "home", "stats", "analysis"],
    answer:
      "📊 The Dashboard shows totals (income, expenses, balance) and quick insights. Use filters to view weekly/monthly data.",
    actions: [{ label: "Open Dashboard", route: "/dashboard" }],
  },
  {
    id: "add",
    title: "Add Transaction",
    keywords: ["add", "transaction", "income", "expense", "record", "entry"],
    answer:
      "🧾 You can add a transaction using Add Transaction — or type here like: “spent 45 on food today”.",
    actions: [{ label: "Open Add Transaction", route: "/add-transaction" }],
  },
  {
    id: "currency",
    title: "Multi-Currency",
    keywords: ["currency", "exchange", "rates", "usd", "nzd", "aud", "convert", "converter"],
    answer:
      "🌍 Multi-currency lets you view amounts in different currencies using exchange rates. Cached rates help when offline.",
    actions: [{ label: "Open Currency", route: "/converter" }],
  },
  {
    id: "qr",
    title: "QR Code",
    keywords: ["qr", "scan", "code", "share", "mobile"],
    answer:
      "🔳 QR Code generates a personal link to your summary. Login is required to generate your QR.",
    actions: [{ label: "Open QR", route: "/generate-qr" }],
  },
  {
    id: "reports",
    title: "Reports / Export",
    keywords: ["report", "export", "pdf", "csv", "download", "print"],
    answer:
      "📄 Reports/Export is planned. For now you can use Transaction PDF and QR summary.",
    actions: [{ label: "Reports (Coming Soon)", route: "/reports" }],
  },
  {
    id: "login",
    title: "Login",
    keywords: ["login", "log in", "sign in", "signin"],
    answer: "🔐 Login is required for protected features like Dashboard, QR and saving personalised data.",
    actions: [{ label: "Go to Login", route: "/login" }],
  },
  {
    id: "register",
    title: "Register",
    keywords: ["register", "sign up", "signup", "create account"],
    answer: "📝 Create an account to save your transactions and view your dashboard.",
    actions: [{ label: "Go to Register", route: "/register" }],
  },
  {
    id: "forgot",
    title: "Forgot Password",
    keywords: ["forgot", "reset", "password", "forgot password"],
    answer: "📧 Use Forgot Password to reset your login password via email instructions.",
    actions: [{ label: "Reset Password", route: "/forgot-password" }],
  },
  
];

export const FALLBACK =
  "🤖 I can help with: Dashboard, Add Transaction, Multi-currency, QR Code, Login/Register.\nType 'menu' to see buttons.";