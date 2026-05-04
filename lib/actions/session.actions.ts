'use server';

import VoiceSession from "@/database/models/voice-session.model";
import { connectToDatabase } from "@/database/mongoose";
import { EndSessionResult, StartSessionResult } from "@/type";
import { getCurrentBillingPeriodStart } from "../subscription-constants";
import { getUserPlanLimits } from "../billing";



// 开始语音对话
export const startVoiceSession = async (clerkId: string, bookId: string): Promise<StartSessionResult> => {
    try {
        await connectToDatabase();
        
        // Limits/Plan 以查看是否允许会话。
        const limits = await getUserPlanLimits();
        const billingPeriodStart = getCurrentBillingPeriodStart();

        const userSessionsCount = await VoiceSession.countDocuments({
            clerkId,
            billingPeriodStart
        });

        if (userSessionsCount >= limits.sessionsPerMonth) {
            return {
                success: false,
                error: `您已达到本月语音会话次数上限（${limits.sessionsPerMonth}次）。请升级计划以继续使用。`,
                isBillingError: true,
            };
        }

        const session = await VoiceSession.create({
            clerkId,
            bookId,
            startedAt: new Date(),
            billingPeriodStart,
            durationSeconds: 0,
        })

        return {
            success: true,
            sessionId: session._id.toString(),
            maxDurationMinutes: limits.sessionMinutes,
        }

    } catch (e) {
     console.error('开始语音对话失败', e);
     return { success: false, error: '开始语音对话失败，请稍后重试' };
    }
}

// 结束语音对话
export const endVoiceSession = async (sessionId: string, durationSeconds: number): Promise<EndSessionResult> => {
    try {
        await connectToDatabase();

        const result = await VoiceSession.findByIdAndUpdate(sessionId, {
            endedAt: new Date(),
            durationSeconds,
        });

        if (!result) {
            return { success: false, error: '未找到该会话' };
        }

        return { success: true };
    } catch (e) {
        console.error('结束语音对话失败', e);
        return { success: false };
    }
}
