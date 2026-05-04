'use client';

// 核心 Hook：初始化 Vapi SDK，管理通话生命周期（idle/connecting/starting/listening/thinking/speaking），
// 追踪消息数组 + 流式消息，处理通话时长计时器与上限控制，通过 Server Actions 进行会话记录

import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

import { ASSISTANT_ID, DEFAULT_VOICE, VOICE_SETTINGS } from '@/lib/constants';
import { getVoice } from '@/lib/utils';
import { IBook, Messages } from '@/type';
import { startVoiceSession, endVoiceSession } from '@/lib/actions/session.actions';
import { useUserPlanLimits } from '@/hooks/use-billing';

export function useLatestRef<T>(value: T) {
    const ref = useRef(value);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref;
}

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;
const TIMER_INTERVAL_MS = 1000;
const SECONDS_PER_MINUTE = 60;
const TIME_WARNING_THRESHOLD = 60; // 剩余秒数低于此值时显示警告

let vapi: InstanceType<typeof Vapi> | null = null;
function getVapi() {
    if (!vapi) {
        if (!VAPI_API_KEY) {
            console.error('NEXT_PUBLIC_VAPI_API_KEY 环境变量未设置，请在 .env 文件中配置');
            return null;
        }
        vapi = new Vapi(VAPI_API_KEY);
    }
    return vapi;
}

export type CallStatus = 'idle' | 'connecting' | 'starting' | 'listening' | 'thinking' | 'speaking';

export function useVapi(book: IBook) {
    const { userId } = useAuth();
    const limits = useUserPlanLimits(); // 订阅限制
    const router = useRouter();

    const [status, setStatus] = useState<CallStatus>('idle');
    const [messages, setMessages] = useState<Messages[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [currentUserMessage, setCurrentUserMessage] = useState('');
    const [duration, setDuration] = useState(0);
    const [limitError, setLimitError] = useState<string | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const sessionIdRef = useRef<string | null>(null);
    const isStoppingRef = useRef(false);

    // 保持 ref 与最新值同步，用于回调函数中
    const maxDurationRef = useLatestRef(limits.sessionMinutes * 60);
    const durationRef = useLatestRef(duration);
    const voice = book.persona || DEFAULT_VOICE;

    // 注册 Vapi 事件监听器
    useEffect(() => {
        const handlers = {
            'call-start': () => {
                isStoppingRef.current = false;
                setStatus('starting'); // AI 先说话，等待中
                setCurrentMessage('');
                setCurrentUserMessage('');

                // 启动通话计时器
                startTimeRef.current = Date.now();
                setDuration(0);
                timerRef.current = setInterval(() => {
                    if (startTimeRef.current) {
                        const newDuration = Math.floor((Date.now() - startTimeRef.current) / TIMER_INTERVAL_MS);
                        setDuration(newDuration);

                        // 检查通话时长上限
                        if (newDuration >= maxDurationRef.current) {
                            getVapi()?.stop();
                            setLimitError(
                                `会话时长已达上限（${Math.floor(
                                    maxDurationRef.current / SECONDS_PER_MINUTE,
                                )} 分钟）。即将返回主页...`,
                            );
                            // 延时重定向
                            setTimeout(() => {
                                router.push('/');
                            }, 3000);
                        }
                    }
                }, TIMER_INTERVAL_MS);
            },

            'call-end': () => {
                // 不在这里重置 isStoppingRef — 延迟事件可能仍会触发
                setStatus('idle');
                setCurrentMessage('');
                setCurrentUserMessage('');

                // 停止计时器
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }

                // 结束会话记录
                if (sessionIdRef.current) {
                    endVoiceSession(sessionIdRef.current, durationRef.current).catch((err) =>
                        console.error('结束语音会话失败:', err),
                    );
                    sessionIdRef.current = null;
                }

                startTimeRef.current = null;
            },

            'speech-start': () => {
                if (!isStoppingRef.current) {
                    setStatus('speaking');
                }
            },
            'speech-end': () => {
                if (!isStoppingRef.current) {
                    // AI 说完后，用户可以说话
                    setStatus('listening');
                }
            },

            message: (message: {
                type: string;
                role: string;
                transcriptType: string;
                transcript: string;
            }) => {
                if (message.type !== 'transcript') return;

                // 用户说完 → AI 正在思考
                if (message.role === 'user' && message.transcriptType === 'final') {
                    if (!isStoppingRef.current) {
                        setStatus('thinking');
                    }
                    setCurrentUserMessage('');
                }

                // 用户 partial 转写 → 实时显示
                if (message.role === 'user' && message.transcriptType === 'partial') {
                    setCurrentUserMessage(message.transcript);
                    return;
                }

                // AI partial 转写 → 逐词显示 (Vapi 助手 partial 是增量 token)
                if (message.role === 'assistant' && message.transcriptType === 'partial') {
                    setCurrentMessage((prev) => prev + message.transcript);
                    return;
                }

                // final 转写 → 添加到消息列表
                if (message.transcriptType === 'final') {
                    if (message.role === 'assistant') setCurrentMessage('');
                    if (message.role === 'user') setCurrentUserMessage('');

                    setMessages((prev) => {
                        const isDupe = prev.some(
                            (m) => m.role === message.role && m.content === message.transcript,
                        );
                        return isDupe ? prev : [...prev, { role: message.role, content: message.transcript }];
                    });
                }
            },

            error: (error: Error) => {
                console.error('Vapi 错误:', error);
                // 不在这里重置 isStoppingRef — 延迟事件可能仍会触发
                setStatus('idle');
                setCurrentMessage('');
                setCurrentUserMessage('');

                // 出错时停止计时器
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }

                // 出错时结束会话记录
                if (sessionIdRef.current) {
                    endVoiceSession(sessionIdRef.current, durationRef.current).catch((err) =>
                        console.error('出错时结束语音会话失败:', err),
                    );
                    sessionIdRef.current = null;
                }

                // 显示用户友好的错误提示
                const errorMessage = error.message?.toLowerCase() || '';
                if (errorMessage.includes('timeout') || errorMessage.includes('silence')) {
                    setLimitError('由于长时间未活动，会话已结束。点击麦克风重新开始。');
                } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                    setLimitError('连接已断开，请检查网络后重试。');
                } else {
                    setLimitError('会话意外结束。点击麦克风重新开始。');
                }

                startTimeRef.current = null;
            },
        };

        // 注册所有事件处理器
        Object.entries(handlers).forEach(([event, handler]) => {
            getVapi()?.on(event as keyof typeof handlers, handler as () => void);
        });

        return () => {
            // 组件卸载时结束活跃会话
            if (sessionIdRef.current) {
                getVapi()?.stop();
                endVoiceSession(sessionIdRef.current, durationRef.current).catch((err) =>
                    console.error('组件卸载时结束语音会话失败:', err),
                );
                sessionIdRef.current = null;
            }
            // 清理事件处理器
            Object.entries(handlers).forEach(([event, handler]) => {
                getVapi()?.off(event as keyof typeof handlers, handler as () => void);
            });
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const start = useCallback(async () => {
        let createdSessionId: string | null = null;
        if (!userId) {
            setLimitError('请先登录以开始语音对话。');
            return;
        }

        setLimitError(null);
        setStatus('connecting');

        try {
            // 检查会话限制并创建会话记录
            const result = await startVoiceSession(userId, book._id);

            if (!result.success) {
                setLimitError(result.error || '会话次数已达上限，请升级您的套餐。');
                setStatus('idle');
                return;
            }

            createdSessionId = result.sessionId || null;
            sessionIdRef.current = createdSessionId;
            // 注意：服务端返回的 maxDurationMinutes 仅供参考
            // 实际限制由 useLatestRef(limits.sessionMinutes * 60) 执行

            const firstMessage = `嘿，很高兴认识你。在我们深入之前，先问一下：你读过《${book.title}》吗？还是说我们从头开始？`;

            const vapiInstance = getVapi();
            if (!vapiInstance) {
                setLimitError('语音服务尚未配置（缺少 API Key），无法启动会话。');
                setStatus('idle');
                return;
            }

            await vapiInstance.start(ASSISTANT_ID, {
                firstMessage,
                // transcriber: {
                //     provider: 'google',
                //     model: 'gemini-2.5-flash',
                //     language: 'Chinese',
                // },
                variableValues: {
                    title: book.title,
                    author: book.author,
                    bookId: book._id,
                },
                // voice: {
                //     provider: "minimax",
                //     model: "speech-02-hd",
                //     voiceId: "Wise_Woman",
                //     languageBoost: "Chinese"
                // },
            });
        } catch (err) {
            if (createdSessionId && sessionIdRef.current === createdSessionId) {
                await endVoiceSession(createdSessionId, durationRef.current).catch((cleanupErr) =>
                    console.error('启动失败后结束语音会话失败:', cleanupErr),
                );
                sessionIdRef.current = null;
            }

            console.error('启动通话失败:', err);
            setStatus('idle');
            setLimitError('启动语音对话失败，请重试。');
        }
    }, [book._id, book.title, book.author, voice, userId]);

    const stop = useCallback(() => {
        isStoppingRef.current = true;
        getVapi()?.stop();
    }, []);

    const clearError = useCallback(() => {
        setLimitError(null);
    }, []);

    const isActive =
        status === 'starting' ||
        status === 'listening' ||
        status === 'thinking' ||
        status === 'speaking';

    // 计算剩余时间
    const maxDurationSeconds = limits.sessionMinutes * SECONDS_PER_MINUTE;
    const remainingSeconds = Math.max(0, maxDurationSeconds - duration);
    const showTimeWarning =
        isActive && remainingSeconds <= TIME_WARNING_THRESHOLD && remainingSeconds > 0;

    return {
        status,
        isActive,
        messages,
        currentMessage,
        currentUserMessage,
        duration,
        start,
        stop,
        limitError,
        clearError,
        maxDurationSeconds,
        remainingSeconds,
        showTimeWarning,
    };
}

export default useVapi;
