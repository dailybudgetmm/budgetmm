import { z } from 'zod';
import { 
  insertUserSchema, users,
  insertCategorySchema, categories,
  insertTransactionSchema, transactions,
  insertBudgetSchema, budgets,
  insertSavingsGoalSchema, savingsGoals,
  insertRecurringSchema, recurringTransactions,
  insertMessageSchema, messages,
  insertAnnouncementSchema, announcements,
  insertSettingSchema, settings
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  users: {
    sync: {
      method: 'POST' as const,
      path: '/api/users/sync' as const,
      input: z.object({
        firebaseUid: z.string(),
        email: z.string(),
        displayName: z.string().nullable().optional(),
        photoURL: z.string().nullable().optional(),
      }),
      responses: { 200: z.custom<typeof users.$inferSelect>() }
    },
    list: {
      method: 'GET' as const,
      path: '/api/users' as const,
      responses: { 200: z.array(z.custom<typeof users.$inferSelect>()) }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/users/:id' as const,
      input: z.object({ defaultCurrency: z.string() }),
      responses: { 200: z.custom<typeof users.$inferSelect>(), 404: errorSchemas.notFound }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/users/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound }
    }
  },
  transactions: {
    list: {
      method: 'GET' as const,
      path: '/api/transactions' as const,
      responses: { 200: z.array(z.custom<typeof transactions.$inferSelect & { category: typeof categories.$inferSelect }>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/transactions' as const,
      input: insertTransactionSchema,
      responses: { 201: z.custom<typeof transactions.$inferSelect>(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/transactions/:id' as const,
      input: insertTransactionSchema.partial(),
      responses: { 200: z.custom<typeof transactions.$inferSelect>(), 404: errorSchemas.notFound }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/transactions/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound }
    }
  },
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories' as const,
      responses: { 200: z.array(z.custom<typeof categories.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/categories' as const,
      input: insertCategorySchema,
      responses: { 201: z.custom<typeof categories.$inferSelect>(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/categories/:id' as const,
      input: insertCategorySchema.partial(),
      responses: { 200: z.custom<typeof categories.$inferSelect>(), 404: errorSchemas.notFound }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/categories/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound }
    }
  },
  budgets: {
    list: {
      method: 'GET' as const,
      path: '/api/budgets' as const,
      responses: { 200: z.array(z.custom<typeof budgets.$inferSelect & { category: typeof categories.$inferSelect }>()) }
    },
    upsert: {
      method: 'POST' as const,
      path: '/api/budgets' as const,
      input: insertBudgetSchema,
      responses: { 200: z.custom<typeof budgets.$inferSelect>() }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/budgets/:id' as const,
      responses: { 204: z.void() }
    }
  },
  savings: {
    list: {
      method: 'GET' as const,
      path: '/api/savings' as const,
      responses: { 200: z.array(z.custom<typeof savingsGoals.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/savings' as const,
      input: insertSavingsGoalSchema,
      responses: { 201: z.custom<typeof savingsGoals.$inferSelect>() }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/savings/:id' as const,
      input: insertSavingsGoalSchema.partial(),
      responses: { 200: z.custom<typeof savingsGoals.$inferSelect>(), 404: errorSchemas.notFound }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/savings/:id' as const,
      responses: { 204: z.void() }
    }
  },
  recurring: {
    list: {
      method: 'GET' as const,
      path: '/api/recurring' as const,
      responses: { 200: z.array(z.custom<typeof recurringTransactions.$inferSelect & { category: typeof categories.$inferSelect }>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/recurring' as const,
      input: insertRecurringSchema,
      responses: { 201: z.custom<typeof recurringTransactions.$inferSelect>() }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/recurring/:id' as const,
      input: insertRecurringSchema.partial(),
      responses: { 200: z.custom<typeof recurringTransactions.$inferSelect>() }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/recurring/:id' as const,
      responses: { 204: z.void() }
    }
  },
  messages: {
    list: {
      method: 'GET' as const,
      path: '/api/messages' as const,
      responses: { 200: z.array(z.custom<typeof messages.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/messages' as const,
      input: insertMessageSchema,
      responses: { 201: z.custom<typeof messages.$inferSelect>(), 400: errorSchemas.validation }
    }
  },
  announcements: {
    list: {
      method: 'GET' as const,
      path: '/api/announcements' as const,
      responses: { 200: z.array(z.custom<typeof announcements.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/announcements' as const,
      input: insertAnnouncementSchema,
      responses: { 201: z.custom<typeof announcements.$inferSelect>() }
    }
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings/:key' as const,
      responses: { 200: z.custom<typeof settings.$inferSelect>(), 404: errorSchemas.notFound }
    },
    set: {
      method: 'POST' as const,
      path: '/api/settings' as const,
      input: insertSettingSchema,
      responses: { 200: z.custom<typeof settings.$inferSelect>() }
    }
  },
  admin: {
    stats: {
      method: 'GET' as const,
      path: '/api/admin/stats' as const,
      responses: {
        200: z.object({
          totalUsers: z.number(),
          totalExpenses: z.number(),
          dailyExpenses: z.number(),
          monthlyExpenses: z.number(),
        })
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}
