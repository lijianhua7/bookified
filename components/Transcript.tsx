"use client";

import { useEffect, useRef } from "react";
import { Mic } from "lucide-react";
import { Messages } from "@/type";

interface TranscriptProps {
  messages: Messages[];
  currentMessage: string;       // AI 助手正在流式输出的文本
  currentUserMessage: string;   // 用户正在流式输入的文本
}

export default function Transcript({
  messages,
  currentMessage,
  currentUserMessage,
}: TranscriptProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // 当消息变化或流式文本更新时，自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentMessage, currentUserMessage]);

  const isEmpty =
    messages.length === 0 && !currentMessage && !currentUserMessage;

  if (isEmpty) {
    return (
      <div className="transcript-container min-h-[400px]">
        <div className="transcript-empty">
          <Mic className="w-12 h-12 text-[#ccc] mb-4" />
          <p className="transcript-empty-text">暂无对话记录</p>
          <p className="transcript-empty-hint">
            点击上方麦克风按钮开始对话
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="transcript-container">
      <div className="transcript-messages">
        {/* 已完成的历史消息 */}
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={idx}
              className={`transcript-message ${
                isUser
                  ? "transcript-message-user"
                  : "transcript-message-assistant"
              }`}
            >
              <div
                className={`transcript-bubble ${
                  isUser
                    ? "transcript-bubble-user"
                    : "transcript-bubble-assistant"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {/* 正在流式输出的 AI 助手消息 */}
        {currentMessage && (
          <div className="transcript-message transcript-message-assistant">
            <div className="transcript-bubble transcript-bubble-assistant">
              {currentMessage}
              <span className="transcript-cursor" />
            </div>
          </div>
        )}

        {/* 正在流式输入的用户消息 */}
        {currentUserMessage && (
          <div className="transcript-message transcript-message-user">
            <div className="transcript-bubble transcript-bubble-user">
              {currentUserMessage}
              <span className="transcript-cursor" />
            </div>
          </div>
        )}

        {/* 锚点元素，用于自动滚动 */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
