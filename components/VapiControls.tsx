"use client";

import useVapi from "@/hooks/useVapi";
import { Mic, MicOff } from "lucide-react";
import { IBook } from "@/type";
import Image from "next/image";
import Transcript from "@/components/Transcript";

export default function VapiControls({ book }: { book: IBook }) {
  const {
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
  } = useVapi(book);

  return (
    <>
      {/* 居中内容区域 */}
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* ====== 头部卡片 ====== */}
        <div className="vapi-header-card">
          {/* 左侧: 封面 + 麦克风按钮 */}
          <div className="vapi-cover-wrapper">
            <Image
              src={book.coverURL}
              alt={book.title}
              width={120}
              height={180}
              className="vapi-cover-image"
              priority
            />

            {/* 麦克风按钮 — 叠加在封面右下角 */}
            <div className="vapi-mic-wrapper">
              {/* AI 说话/思考中时显示脉冲光环 */}
              {isActive && (status === "speaking" || status === "thinking") && (
                <span className="vapi-pulse-ring" />
              )}
              <button
                type="button"
                className={`vapi-mic-btn ${
                  isActive ? "vapi-mic-btn-active" : "vapi-mic-btn-inactive"
                }`}
                aria-label={isActive ? "关闭麦克风" : "开启麦克风"}
                disabled={status === "connecting"}
                onClick={isActive ? stop : start}
              >
                {isActive ? (
                  <Mic className="w-6 h-6 text-white" />
                ) : (
                  <MicOff className="w-6 h-6 text-[#ccc]" />
                )}
              </button>
            </div>
          </div>

          {/* 右侧: 书籍信息 */}
          <div className="flex flex-col gap-3 min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#212a3b] font-serif leading-tight">
              {book.title}
            </h1>
            <p className="text-base sm:text-lg text-[#3d485e]">
              作者：{book.author}
            </p>

            {/* 状态徽章行 */}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {/* 状态指示器 */}
              <span className="vapi-status-indicator">
                <span className="vapi-status-dot vapi-status-dot-ready" />
                <span className="vapi-status-text">就绪</span>
              </span>

              {/* 语音标签 */}
              <span className="vapi-status-indicator">
                <span className="vapi-status-text">
                  语音：{book.persona || "默认"}
                </span>
              </span>

              {/* 计时器 */}
              <span className="vapi-status-indicator">
                <span className="vapi-status-text">0:00/15:00</span>
              </span>
            </div>
          </div>
        </div>
        {limitError && (
          <div role="alert" className="vapi-error-banner">
            <span>{limitError}</span>
            <button type="button" onClick={clearError}>
              关闭
            </button>
          </div>
        )}
        {/* ====== 对话记录区域 ====== */}
        <div className="vapi-transcript-wrapper">
          <Transcript
            messages={messages}
            currentMessage={currentMessage}
            currentUserMessage={currentUserMessage}
          />
        </div>
      </div>
    </>
  );
}
