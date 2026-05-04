export type PlanType = 'free' | 'standard' | 'pro';

export const PLAN_LIMITS = {
  free: { books: 1, sessionsPerMonth: 5, sessionMinutes: 5, sessionHistory: false },
  standard: { books: 10, sessionsPerMonth: 100, sessionMinutes: 15, sessionHistory: true },
  pro: { books: 100, sessionsPerMonth: Infinity, sessionMinutes: 60, sessionHistory: true }
};

export const getCurrentBillingPeriodStart = (): Date => {
    const now = new Date();
    // 使用 UTC 月初，避免不同时区实例产生不同账期边界
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
};