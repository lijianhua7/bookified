import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) throw new Error("请配置MONGODB_URI 环境变量");

// 声明全局变量 mongooseCache
declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// 获取全局 mongoose 缓存
let cached =
  global.mongooseCache ||
  (global.mongooseCache = { conn: null, promise: null });

// 连接数据库
export const connectToDatabase = async () => {
  // 如果已经连接，直接返回
  if (cached.conn) return cached.conn;

  // 如果没有连接，创建连接
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000, // 服务器选择超时 30 秒
      connectTimeoutMS: 30000, // 连接超时 30 秒
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("数据库连接失败", e);
    throw e;
  }
  console.info("数据库连接成功");
  return cached.conn;
};
