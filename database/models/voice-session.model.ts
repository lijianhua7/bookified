import { IVoiceSession } from "@/type";
import { Schema, models, model } from "mongoose";

// 创建 VoiceSessionSchema
const VoiceSessionSchema = new Schema<IVoiceSession>({
    clerkId: {type: String, required: true, index: true},
    bookId: {type: Schema.Types.ObjectId, ref: "Book", required: true},
    startedAt: {type: Date, required: true, default: Date.now},
    endedAt: {type: Date},
    durationSeconds: {type: Number, required: true, default: 0},
    billingPeriodStart: {type: Date, required: true, index: true},
}, {timestamps: true})

// 按用户和计费周期查询创建复合索引，对订阅用户收费
VoiceSessionSchema.index({clerkId: 1, billingPeriodStart: 1});

// 防止每次 Next.js 开发环境热更时重复创建模型
const VoiceSession = models.VoiceSession || model("VoiceSession", VoiceSessionSchema);

export default VoiceSession;
