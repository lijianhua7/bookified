"use server";

import { auth } from "@clerk/nextjs/server";

import { connectToDatabase } from "@/database/mongoose";
import { escapeRegex, generateSlug, serializeData } from "../utils";
import { CreateBook, TextSegment } from "@/type";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { getUserPlanLimits } from "../billing";

export const getAllBooks = async (query?: string) => {
  try {
    await connectToDatabase();

    let filter = {};
    if (query) {
      const pattern = new RegExp(escapeRegex(query), 'i');
      filter = {
        $or: [
          { title: { $regex: pattern } },
          { author: { $regex: pattern } }
        ]
      };
    }

    const books = await Book.find(filter).sort({createdAt: -1}).lean();

    return {
      success: true,
      data: serializeData(books),
    };
  } catch (e) {
    console.error("获取所有图书失败", e);
    return {
      success: false,
      error: e,
    };
  }
};

// 检查图书是否已存在
export const checkBookExists = async (title: string) => {
  try {
    await connectToDatabase();

    const slug = generateSlug(title);

    const existingBook = await Book.findOne({ slug }).lean();

    if (existingBook) {
      return {
        exists: true,
        book: serializeData(existingBook),
      };
    }

    return {
      exists: false,
    };
  } catch (e) {
    console.error("图书已存在", e);
    return {
      exists: false,
      error: e,
    };
  }
};

// 创建图书
export const createBook = async (data: CreateBook) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("未授权");
    }

    await connectToDatabase();

    const slug = generateSlug(data.title);

    // 创建图书之前，先检查是否有相同标题的图书已经存在
    const existingBook = await Book.findOne({ slug }).lean();
    if (existingBook) {
      return {
        success: true,
        // 从服务器操作中传递大型或复杂对象时，必须将数据序列化为纯 JSON 对象
        // data: JSON.parse(JSON.stringify(existingBook)),
        data: serializeData(existingBook), // 序列化为纯 JSON 对象
        alreadyExists: true,
      };
    }

    // 创建图书前先检查订阅限制
    const limits = await getUserPlanLimits();
    const userBooksCount = await Book.countDocuments({ clerkId: userId });

    if (userBooksCount >= limits.books) {
      return {
        success: false,
        error: `您已达到当前订阅计划的图书上传上限（${limits.books}本）。请升级计划以继续上传。`,
        isBillingError: true,
      };
    }

    const book = await Book.create({ ...data, clerkId: userId, slug, totalSegments: 0 });

    revalidatePath('/');

    return {
      success: true,
      data: serializeData(book),
    };
  } catch (e) {
    console.error("创建图书失败", e);
    return {
      success: false,
      error: e,
    };
  }
};

// 保存图书段落
export const saveBookSegments = async (
  bookId: string,
  clerkId: string,
  segments: TextSegment[],
) => {
  try {
    await connectToDatabase();

    console.log("正在保存图书段落...");

    // 准备要插入的段落数据
    const segmentsToInsert = segments.map(
      ({ text, segmentIndex, pageNumber, wordCount }) => ({
        clerkId,
        bookId,
        content: text,
        segmentIndex,
        pageNumber,
        wordCount,
      }),
    );

    // 批量插入段落
    await BookSegment.insertMany(segmentsToInsert);

    // 更新图书的总段落数
    await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length });

    console.log("图书段落保存成功");

    return {
      success: true,
      data: {
        segmentsCreated: segments.length,
      },
    };
  } catch (e) {
    console.error("保存图书段落失败", e);
    // 保存失败前可能已经存储了一些图书段落，需要删除
    await BookSegment.deleteMany({ bookId });
    // 删除该图书
    await Book.findByIdAndDelete({_id: bookId});
    console.log("由于保存段落失败，已删除该图书和所有图书段落");

    return {
      success: false,
      error: e,
    };
  }
};

// 根据 slug 获取图书
export const getBookBySlug = async (slug: string) => {
  try {
    await connectToDatabase();

    const book = await Book.findOne({ slug }).lean();

    if (!book) {
      return {
        success: false,
        error: "图书不存在",
      };
    }

    return {
      success: true,
      data: serializeData(book),
    };
  } catch (e) {
    console.error("根据 slug 获取图书失败", e);
    return {
      success: false,
      error: e,
    };
  }
};

// 搜索图书段落
export const searchBookSegments = async (bookId: string, query: string, limit: number = 5) => {
    try {
        await connectToDatabase();

        console.log(`正在搜索图书段落: "${query}", ID: ${bookId}`);

        const bookObjectId = new mongoose.Types.ObjectId(bookId);

        // 首先尝试使用 MongoDB 文本搜索（需要文本索引）
        let segments: Record<string, unknown>[] = [];
        try {
            segments = await BookSegment.find({
                bookId: bookObjectId,
                $text: { $search: query },
            })
                .select('_id bookId content segmentIndex pageNumber wordCount')
                .sort({ score: { $meta: 'textScore' } })
                .limit(limit)
                .lean();
        } catch {
            // 文本索引可能不存在 - 回退到正则表达式搜索
            segments = [];
        }

        // 回退: 正则表达式搜索匹配任意关键字
        if (segments.length === 0) {
            const keywords = query.split(/\s+/).filter((k) => k.length > 2);
            const fallbackTerms = keywords.length > 0 ? keywords : [query.trim()];
            const pattern = fallbackTerms.map(escapeRegex).join('|');

            if (!pattern) {
                return { success: true, data: [] };
            }

            segments = await BookSegment.find({
                bookId: bookObjectId,
                content: { $regex: pattern, $options: 'i' },
            })
                .select('_id bookId content segmentIndex pageNumber wordCount')
                .sort({ segmentIndex: 1 })
                .limit(limit)
                .lean();
        }

        console.log(`搜索完成,共找到 ${segments.length} 个结果`);

        return {
            success: true,
            data: serializeData(segments),
        };
    } catch (error) {
        console.error('搜索图书段落失败:', error);
        return {
            success: false,
            error: (error as Error).message,
            data: [],
        };
    }
};
