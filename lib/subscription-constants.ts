export type PlanType = 'free' | 'standard' | 'pro';

export const PLAN_LIMITS = {
  free: { books: 1, sessionsPerMonth: 5, sessionMinutes: 5, sessionHistory: false },
  standard: { books: 10, sessionsPerMonth: 100, sessionMinutes: 15, sessionHistory: true },
  pro: { books: 100, sessionsPerMonth: Infinity, sessionMinutes: 60, sessionHistory: true }
};

export const getCurrentBillingPeriodStart = (): Date => {
    const now = new Date();

    // 获取当月第一天 00:00:00
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
};
