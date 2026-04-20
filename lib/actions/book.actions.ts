"use server";

import { connectToDatabase } from "@/database/mongoose";
import { generateSlug, serializeData } from "../utils";
import { CreateBook, TextSegment } from "@/type";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";

export const getAllBooks = async () => {
  try {
    await connectToDatabase();

    const books = await Book.find().sort({createdAt: -1}).lean();

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

    // Todo: 创建图书前先检查订阅限制

    const book = await Book.create({ ...data, slug, totalSegments: 0 });

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
    await Book.findByIdAndDelete(bookId);
    console.log("由于保存段落失败，已删除该图书和所有图书段落");

    return {
      success: false,
      error: e,
    };
  }
};
