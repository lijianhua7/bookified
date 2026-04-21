import { IBookSegment } from "@/type";
import { Schema, models, model } from "mongoose";

// 创建 BookSegmentSchema
const BookSegmentSchema = new Schema<IBookSegment>({
    clerkId: {type: String, required: true},
    bookId: {type: Schema.Types.ObjectId, ref: "Book", required: true, index: true},
    content: {type: String, required: true},
    segmentIndex: {type: Number, required: true, index: true},
    pageNumber: {type: Number, index: true},
    wordCount: {type: Number, required: true},
}, {timestamps: true})

// 为常见查询场景创建复合字段索引，上面定义的"index: true"是单字段索引
// 当 Vapi 朗读一本书时，它会按顺序获取段落。而这个复合索引可以让查找即时完成，而不是扫描数据集中的每个数据段。
BookSegmentSchema.index({bookId: 1, segmentIndex: 1}, {unique: true});
BookSegmentSchema.index({bookId: 1, pageNumber: 1});
BookSegmentSchema.index({bookId: 1, content: 'text'});

// 防止每次 Next.js 开发环境热更时重复创建模型
const BookSegment = models.BookSegment || model("BookSegment", BookSegmentSchema);

export default BookSegment;
