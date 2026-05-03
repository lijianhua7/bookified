export const getCurrentBillingPeriodStart = (): Date => {
    const now = new Date();

    // 获取当月第一天 00:00:00
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}