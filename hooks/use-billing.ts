import { useAuth } from '@clerk/nextjs';
import { PLAN_LIMITS, PlanType } from '@/lib/subscription-constants';

export const useUserPlan = (): PlanType => {
    const { has } = useAuth();
    
    // 如果用户是 PRO 计划
    if (has && has({ plan: 'user:pro' })) {
        return 'pro';
    }
    
    // 如果用户是 STANDARD 计划
    if (has && has({ plan: 'user:standard' })) {
        return 'standard';
    }
    
    // 默认没有订阅则是 FREE 计划
    return 'free';
};

export const useUserPlanLimits = () => {
    const plan = useUserPlan();
    return { plan, ...PLAN_LIMITS[plan] };
};
