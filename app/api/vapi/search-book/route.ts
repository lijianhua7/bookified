import { NextResponse } from 'next/server';

import { searchBookSegments } from '@/lib/actions/book.actions';

// 处理图书搜索逻辑的辅助函数
async function processBookSearch(bookId: unknown, query: unknown) {
    // 在转换前校验输入，防止 null/undefined 变成 "null"/"undefined" 字符串
    if (bookId == null || query == null || query === '') {
        return { result: '缺少 bookId 或 query 参数' };
    }

    // 将 bookId 转为字符串
    const bookIdStr = String(bookId);
    const queryStr = String(query).trim();

    // 转换后的额外校验
    if (!bookIdStr || bookIdStr === 'null' || bookIdStr === 'undefined' || !queryStr) {
        return { result: '缺少 bookId 或 query 参数' };
    }

    // 执行搜索
    const searchResult = await searchBookSegments(bookIdStr, queryStr, 3);

    // 返回结果
    if (!searchResult.success || !searchResult.data?.length) {
        return { result: '在本书中未找到与该主题相关的信息。' };
    }

    const combinedText = searchResult.data
        .map((segment) => (segment as { content: string }).content)
        .join('\n\n');

    return { result: combinedText };
}

export async function GET() {
    return NextResponse.json({ status: 'ok' });
}

// 解析工具参数（可能是 JSON 字符串或对象）
function parseArgs(args: unknown): Record<string, unknown> {
    if (!args) return {};
    if (typeof args === 'string') {
        try { return JSON.parse(args); } catch { return {}; }
    }
    return args as Record<string, unknown>;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log('Vapi 图书搜索请求:', JSON.stringify(body, null, 2));

        // 支持多种 Vapi 请求格式
        const functionCall = body?.message?.functionCall;
        const toolCallList = body?.message?.toolCallList || body?.message?.toolCalls;

        // 处理单个 functionCall 格式
        if (functionCall) {
            const { name, parameters } = functionCall;
            const parsed = parseArgs(parameters);

            if (name === 'searchBook') {
                const result = await processBookSearch(parsed.bookId, parsed.query);
                return NextResponse.json(result);
            }

            return NextResponse.json({ result: `未知函数: ${name}` });
        }

        // 处理 toolCallList 格式（调用数组）
        if (!toolCallList || toolCallList.length === 0) {
            return NextResponse.json({
                results: [{ result: '未找到工具调用' }],
            });
        }

        const results = [];

        for (const toolCall of toolCallList) {
            const { id, function: func } = toolCall;
            const name = func?.name;
            const args = parseArgs(func?.arguments);

            if (name === 'searchBook') {
                const searchResult = await processBookSearch(args.bookId, args.query);
                results.push({ toolCallId: id, ...searchResult });
            } else {
                results.push({ toolCallId: id, result: `未知函数: ${name}` });
            }
        }

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Vapi 图书搜索错误:', error);
        return NextResponse.json({
            results: [{ result: '处理请求时发生错误' }],
        });
    }
}