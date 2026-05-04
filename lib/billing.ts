import { auth } from '@clerk/nextjs/server';
import { PLAN_LIMITS, PlanType } from './subscription-constants';

export const getUserPlan = async (): Promise<PlanType> => {
    const { has } = await auth();
    
    // 如果用户是 PRO 计划
    if (has({ plan: 'user:pro' })) {
        return 'pro';
    }
    
    // 如果用户是 STANDARD 计划
    if (has({ plan: 'user:standard' })) {
        return 'standard';
    }
    
    // 默认没有订阅则是 FREE 计划
    return 'free';
};

export const getUserPlanLimits = async () => {
    const plan = await getUserPlan();
    return { plan, ...PLAN_LIMITS[plan] };
};
