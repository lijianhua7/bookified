import { MAX_FILE_SIZE } from "@/lib/constants";
import { auth } from "@clerk/nextjs/server";
import { handleUpload, HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        // 处理上传请求
        const jsonResponse = await handleUpload({
            token: process.env.BLOB_READ_WRITE_TOKEN,
            body,
            request,
            // 在生成上传令牌之前执行的函数
            onBeforeGenerateToken: async () => {
                // 检查用户是否登录
                const { userId } = await auth();
                if (!userId) {
                    throw new Error("Unauthorized: 用户未登录");
                }

                return {
                    allowedContentTypes: [
                        "application/pdf",
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                    ],
                    addRandomSuffix: true,
                    maximumSizeInBytes: MAX_FILE_SIZE,
                    tokenPayload: JSON.stringify({ userId }),
                };
            },
            // 上传完成后的回调
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log("文件已上传至 Blob", blob.url);

                const payload = tokenPayload ? JSON.parse(tokenPayload) : null;
                const userId = payload?.userId;

                // TODO: 上报PostHog
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (e) {
        const message = e instanceof Error ? e.message : "未知错误";
        const status = message.includes("Unauthorized") ? 401 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
