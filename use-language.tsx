import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type Language = "en" | "my";

const translations = {
  en: {
    // Nav
    dashboard: "Dashboard",
    history: "History",
    reports: "Reports",
    profile: "Profile",
    admin: "Admin",
    addRecord: "Add Record",
    signIn: "Sign In",
    logout: "Logout",
    budgets: "Budgets",
    savings: "Savings",
    recurring: "Recurring",
    categories: "Categories",
    // Dashboard
    totalBalance: "Total Balance",
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    thisMonth: "This Month",
    monthlyIncome: "Monthly Income",
    monthlyExpenses: "Monthly Expenses",
    monthlyBalance: "Monthly Balance",
    recentTransactions: "Recent Transactions",
    viewAll: "View All",
    noTransactions: "No transactions yet. Start adding some!",
    welcomeBack: "Welcome back",
    spendingByCategory: "Spending by Category",
    // Add transaction
    addRecordTitle: "Add Record",
    trackNew: "Track a new income or expense",
    expense: "Expense",
    income: "Income",
    amount: "Amount",
    category: "Category",
    selectCategory: "Select a category",
    description: "Description",
    descriptionPlaceholder: "What was this for?",
    optional: "Optional",
    save: "Save",
    saving: "Saving...",
    saveExpense: "Save Expense",
    saveIncome: "Save Income",
    // History
    expenseHistory: "Transaction History",
    allTransactions: "All your past transactions",
    date: "Date",
    type: "Type",
    actions: "Actions",
    noTransactionsFound: "No transactions found.",
    filterAll: "All",
    filterToday: "Today",
    filterWeek: "This Week",
    filterMonth: "This Month",
    // Reports
    reportsTitle: "Reports & Analytics",
    spendingTrend: "Spending Trend",
    incomeVsExpense: "Income vs Expense",
    monthlyExpenseChart: "Monthly Expenses",
    noData: "No data available.",
    // Profile
    profileTitle: "Profile",
    editProfile: "Edit Profile",
    currency: "Currency",
    displayName: "Display Name",
    email: "Email",
    language: "Language",
    saveChanges: "Save Changes",
    // Common
    loading: "Loading...",
    delete: "Delete",
    cancel: "Cancel",
    confirm: "Confirm",
    search: "Search",
    noCategories: "No categories found.",
    english: "English",
    myanmar: "မြန်မာ",
  },
  my: {
    // Nav
    dashboard: "ဒက်ရှ်ဘုတ်",
    history: "မှတ်တမ်း",
    reports: "အစီရင်ခံ",
    profile: "ကိုယ်ပိုင်",
    admin: "စီမံသူ",
    addRecord: "မှတ်တမ်းထည့်",
    signIn: "ဝင်ရောက်",
    logout: "ထွက်မည်",
    budgets: "ဘတ်ဂျက်",
    savings: "စုဆောင်းငွေ",
    recurring: "ထပ်ခါထပ်ခါ",
    categories: "အမျိုးအစားများ",
    // Dashboard
    totalBalance: "စုစုပေါင်းလက်ကျန်",
    totalIncome: "စုစုပေါင်းဝင်ငွေ",
    totalExpenses: "စုစုပေါင်းသုံးငွေ",
    thisMonth: "ဤလတွင်",
    monthlyIncome: "လဝင်ငွေ",
    monthlyExpenses: "လသုံးငွေ",
    monthlyBalance: "လလက်ကျန်",
    recentTransactions: "လတ်တလော ငွေစာရင်း",
    viewAll: "အားလုံးကြည့်",
    noTransactions: "ငွေစာရင်း မရှိသေးပါ။ စတင်ထည့်ပါ!",
    welcomeBack: "မင်္ဂလာပါ",
    spendingByCategory: "အမျိုးအစားအလိုက် သုံးငွေ",
    // Add transaction
    addRecordTitle: "မှတ်တမ်းထည့်",
    trackNew: "ဝင်ငွေ သို့မဟုတ် သုံးငွေ မှတ်တမ်းတင်ရန်",
    expense: "သုံးငွေ",
    income: "ဝင်ငွေ",
    amount: "ငွေပမာဏ",
    category: "အမျိုးအစား",
    selectCategory: "အမျိုးအစားရွေးပါ",
    description: "မှတ်ချက်",
    descriptionPlaceholder: "ဘာအတွက် သုံးသနည်း?",
    optional: "ရွေးချယ်နိုင်",
    save: "သိမ်းဆည်း",
    saving: "သိမ်းနေသည်...",
    saveExpense: "သုံးငွေ သိမ်း",
    saveIncome: "ဝင်ငွေ သိမ်း",
    // History
    expenseHistory: "ငွေစာရင်းမှတ်တမ်း",
    allTransactions: "မှတ်တမ်းအားလုံး",
    date: "ရက်စွဲ",
    type: "အမျိုးအစား",
    actions: "လုပ်ဆောင်ချက်",
    noTransactionsFound: "ငွေစာရင်း မတွေ့ပါ။",
    filterAll: "အားလုံး",
    filterToday: "ယနေ့",
    filterWeek: "ဤအပတ်",
    filterMonth: "ဤလ",
    // Reports
    reportsTitle: "အစီရင်ခံနှင့် ခွဲခြမ်းစိတ်ဖြာ",
    spendingTrend: "သုံးငွေ ဦးတည်ချက်",
    incomeVsExpense: "ဝင်ငွေ vs သုံးငွေ",
    monthlyExpenseChart: "လပိုင်းသုံးငွေ",
    noData: "ဒေတာ မရှိပါ။",
    // Profile
    profileTitle: "ကိုယ်ပိုင်ဒေတာ",
    editProfile: "ပြင်ဆင်ရန်",
    currency: "ငွေကြေး",
    displayName: "အမည်",
    email: "အီးမေးလ်",
    language: "ဘာသာစကား",
    saveChanges: "ပြောင်းလဲမှု သိမ်း",
    // Common
    loading: "ခဏစောင့်ပါ...",
    delete: "ဖျက်မည်",
    cancel: "မလုပ်တော့",
    confirm: "အတည်ပြု",
    search: "ရှာဖွေ",
    noCategories: "အမျိုးအစား မရှိပါ။",
    english: "English",
    myanmar: "မြန်မာ",
  },
};

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem("app-lang") as Language) || "en";
  });

  const setLang = useCallback((newLang: Language) => {
    localStorage.setItem("app-lang", newLang);
    setLangState(newLang);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[lang][key] || translations.en[key] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
