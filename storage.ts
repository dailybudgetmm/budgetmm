import { db } from "./db";
import {
  users, categories, transactions, budgets, savingsGoals, recurringTransactions,
  messages, announcements, settings,
  type InsertUser, type User,
  type InsertCategory, type Category,
  type InsertTransaction, type Transaction,
  type InsertBudget, type Budget,
  type InsertSavingsGoal, type SavingsGoal,
  type InsertRecurring, type RecurringTransaction,
  type InsertMessage, type Message,
  type InsertAnnouncement, type Announcement,
  type InsertSetting, type Setting,
  type TransactionWithCategory, type BudgetWithCategory, type RecurringWithCategory
} from "@shared/schema";
import { eq, desc, sql, or, isNull } from "drizzle-orm";

export interface IStorage {
  syncUser(user: { firebaseUid: string, email: string, displayName?: string | null, photoURL?: string | null }): Promise<User>;
  getUserByFirebaseUid(uid: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, data: { defaultCurrency: string }): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;

  getCategories(): Promise<Category[]>;
  getCategoriesForUser(userId: number): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  getTransactions(userId?: number): Promise<TransactionWithCategory[]>;
  getAllTransactions(): Promise<TransactionWithCategory[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, data: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<void>;

  getBudgets(userId: number): Promise<BudgetWithCategory[]>;
  upsertBudget(budget: InsertBudget): Promise<Budget>;
  deleteBudget(id: number): Promise<void>;

  getSavingsGoals(userId: number): Promise<SavingsGoal[]>;
  createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateSavingsGoal(id: number, data: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined>;
  deleteSavingsGoal(id: number): Promise<void>;

  getRecurring(userId: number): Promise<RecurringWithCategory[]>;
  createRecurring(r: InsertRecurring): Promise<RecurringTransaction>;
  updateRecurring(id: number, data: Partial<InsertRecurring>): Promise<RecurringTransaction | undefined>;
  deleteRecurring(id: number): Promise<void>;

  getMessages(): Promise<Message[]>;
  createMessage(msg: InsertMessage): Promise<Message>;

  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(ann: InsertAnnouncement): Promise<Announcement>;

  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(setting: InsertSetting): Promise<Setting>;

  getAdminStats(): Promise<{ totalUsers: number, totalExpenses: number, dailyExpenses: number, monthlyExpenses: number }>;
}

export class DatabaseStorage implements IStorage {
  async syncUser(data: { firebaseUid: string, email: string, displayName?: string | null, photoURL?: string | null }): Promise<User> {
    const existing = await db.select().from(users).where(eq(users.firebaseUid, data.firebaseUid));
    if (existing.length > 0) return existing[0];
    const [newUser] = await db.insert(users).values({
      firebaseUid: data.firebaseUid,
      email: data.email,
      displayName: data.displayName || null,
      photoURL: data.photoURL || null,
    }).returning();
    return newUser;
  }

  async getUserByFirebaseUid(uid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, uid));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, data: { defaultCurrency: string }): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.userId, id));
    await db.delete(budgets).where(eq(budgets.userId, id));
    await db.delete(savingsGoals).where(eq(savingsGoals.userId, id));
    await db.delete(recurringTransactions).where(eq(recurringTransactions.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoriesForUser(userId: number): Promise<Category[]> {
    return await db.select().from(categories).where(
      or(eq(categories.isDefault, true), eq(categories.userId, userId), isNull(categories.userId))
    );
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [cat] = await db.select().from(categories).where(eq(categories.id, id));
    return cat;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category> {
    const [updated] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getTransactions(userId?: number): Promise<TransactionWithCategory[]> {
    let query = db.select().from(transactions) as any;
    if (userId) query = query.where(eq(transactions.userId, userId));
    const results = await query.orderBy(desc(transactions.date));
    const cats = await this.getCategories();
    return results.map((t: Transaction) => ({
      ...t,
      category: cats.find(c => c.id === t.categoryId)!
    }));
  }

  async getAllTransactions(): Promise<TransactionWithCategory[]> {
    return this.getTransactions();
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const [tx] = await db.select().from(transactions).where(eq(transactions.id, id));
    return tx;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newT] = await db.insert(transactions).values(transaction).returning();
    return newT;
  }

  async updateTransaction(id: number, data: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [updated] = await db.update(transactions).set(data).where(eq(transactions.id, id)).returning();
    return updated;
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  async getBudgets(userId: number): Promise<BudgetWithCategory[]> {
    const results = await db.select().from(budgets).where(eq(budgets.userId, userId));
    const cats = await this.getCategories();
    return results.map(b => ({ ...b, category: cats.find(c => c.id === b.categoryId)! }));
  }

  async upsertBudget(budget: InsertBudget): Promise<Budget> {
    const rows = await db.select().from(budgets).where(eq(budgets.userId, budget.userId));
    const existing = rows.find(r => r.categoryId === budget.categoryId && r.currency === budget.currency);
    if (existing) {
      const [updated] = await db.update(budgets).set({ amount: budget.amount, period: budget.period }).where(eq(budgets.id, existing.id)).returning();
      return updated;
    }
    const [newBudget] = await db.insert(budgets).values(budget).returning();
    return newBudget;
  }

  async deleteBudget(id: number): Promise<void> {
    await db.delete(budgets).where(eq(budgets.id, id));
  }

  async getSavingsGoals(userId: number): Promise<SavingsGoal[]> {
    return await db.select().from(savingsGoals).where(eq(savingsGoals.userId, userId)).orderBy(desc(savingsGoals.createdAt));
  }

  async createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal> {
    const [newGoal] = await db.insert(savingsGoals).values(goal).returning();
    return newGoal;
  }

  async updateSavingsGoal(id: number, data: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined> {
    const [updated] = await db.update(savingsGoals).set(data).where(eq(savingsGoals.id, id)).returning();
    return updated;
  }

  async deleteSavingsGoal(id: number): Promise<void> {
    await db.delete(savingsGoals).where(eq(savingsGoals.id, id));
  }

  async getRecurring(userId: number): Promise<RecurringWithCategory[]> {
    const results = await db.select().from(recurringTransactions).where(eq(recurringTransactions.userId, userId)).orderBy(desc(recurringTransactions.createdAt));
    const cats = await this.getCategories();
    return results.map(r => ({ ...r, category: cats.find(c => c.id === r.categoryId)! }));
  }

  async createRecurring(r: InsertRecurring): Promise<RecurringTransaction> {
    const [newR] = await db.insert(recurringTransactions).values(r).returning();
    return newR;
  }

  async updateRecurring(id: number, data: Partial<InsertRecurring>): Promise<RecurringTransaction | undefined> {
    const [updated] = await db.update(recurringTransactions).set(data).where(eq(recurringTransactions.id, id)).returning();
    return updated;
  }

  async deleteRecurring(id: number): Promise<void> {
    await db.delete(recurringTransactions).where(eq(recurringTransactions.id, id));
  }

  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async createMessage(msg: InsertMessage): Promise<Message> {
    const [newMsg] = await db.insert(messages).values(msg).returning();
    return newMsg;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(ann: InsertAnnouncement): Promise<Announcement> {
    const [newAnn] = await db.insert(announcements).values(ann).returning();
    return newAnn;
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async setSetting(setting: InsertSetting): Promise<Setting> {
    const [newSetting] = await db.insert(settings)
      .values(setting)
      .onConflictDoUpdate({ target: settings.key, set: { value: setting.value } })
      .returning();
    return newSetting;
  }

  async getAdminStats(): Promise<{ totalUsers: number, totalExpenses: number, dailyExpenses: number, monthlyExpenses: number }> {
    const usersCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    const expenses = await db.select().from(transactions).where(eq(transactions.type, 'expense'));
    const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const dailyExpenses = expenses.filter(t => new Date(t.date!) >= today).reduce((sum, t) => sum + Number(t.amount), 0);
    const monthlyExpenses = expenses.filter(t => new Date(t.date!) >= firstDayOfMonth).reduce((sum, t) => sum + Number(t.amount), 0);
    return { totalUsers: Number(usersCount[0].count), totalExpenses, dailyExpenses, monthlyExpenses };
  }
}

export const storage = new DatabaseStorage();
