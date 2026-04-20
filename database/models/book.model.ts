import { IBook } from "@/type";
import { Schema, models, model } from "mongoose";

// 创建 BookSchema
const BookSchema = new Schema<IBook>({
    clerkId: {type: String, required: true},
    title: {type: String, required: true},
    slug: {type: String, required: true, unique: true, lowercase: true, trim: true},
    author: {type: String, required: true},
    persona: {type: String},
    fileURL: {type: String, required: true},
    fileBlobKey: {type: String, required: true},
    coverURL: {type: String},
    coverBlobKey: {type: String},
    fileSize: {type: Number, required: true},
    totalSegments: {type: Number, default: 0},
}, {timestamps: true})

// 防止每次 Next.js 开发环境热更时重复创建模型
const Book = models.Book || model("Book", BookSchema);

export default Book;
