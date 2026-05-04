import React from "react";
import { PricingTable } from "@clerk/nextjs";

export const metadata = {
    title: "订阅计划 - Bookify",
    description: "选择适合您的阅读与语音会话计划",
};

export default function SubscriptionsPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-5xl">
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-brown-900 tracking-tight">
                    选择适合您的阅读计划
                </h1>
                <p className="text-lg md:text-xl text-brown-600 max-w-2xl mx-auto">
                    解锁更多书籍上传额度和无限的语音对话体验，开启您全新的阅读旅程。
                </p>
            </div>

            {/* 
              使用 Clerk 的 PricingTable 组件。
              此组件将展示在 Clerk Dashboard 中设置的带有 "standard" 和 "pro" slugs 的产品计划。
            */}
            <div className="flex justify-center w-full mt-8">
                <PricingTable />
            </div>
        </div>
    );
}
