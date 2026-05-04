# Bookify 项目开发指南 (Agent Rules)

## 项目简介
Bookify 是一个基于 Next.js 开发的智能图书应用，支持用户上传 PDF 文档并使用 AI 语音（Vapi）与图书内容进行实时交互对话。项目采用现代化的全栈技术架构，集成了基于 Clerk 的身份和配额管理、基于 Vercel Blob 的对象存储，以及基于 MongoDB 的数据存储。

## 核心技术栈
- **框架**: Next.js (App Router, 版本 16.2.1)
- **UI & 样式**: React 19, Tailwind CSS v4, shadcn/ui, Radix UI, Base UI
- **语言**: TypeScript
- **数据库**: MongoDB & Mongoose
- **身份认证**: Clerk (含基于用户 Metadata 的配额限制)
- **AI 语音**: Vapi (@vapi-ai/web)
- **存储**: Vercel Blob (封面、PDF 文件存储)
- **表单**: React Hook Form, Zod
- **文档处理**: PDF.js (pdfjs-dist)

## 项目结构
- `/app`: Next.js App Router 的主要路由目录，包含 `globals.css` 等全局配置。
- `/components`: 存放业务组件与通用 UI 组件（shadcn/ui 组件位于 `/components/ui`）。
  - 关键组件：`UploadForm`, `VapiControls`, `Transcript`, `BookCard`, `SearchBar` 等。
- `/database`: 包含 MongoDB 连接配置（`mongoose.ts`）与所有的 Mongoose 数据模型。
  - 模型：`book.model.ts`, `book-segment.model.ts`, `voice-session.model.ts`。
- `/lib`: 存放全局通用工具函数以及后端的 Server Actions。
  - `/lib/actions`: `book.actions.ts`, `session.actions.ts` 包含与数据库交互的核心业务逻辑。
  - `/lib/utils.ts`: 通用工具类，包含 PDF 解析、切片生成、类名合并（clsx/tailwind-merge）等。
- `/hooks`: 自定义 React Hooks。
  - 核心 Hooks：`useVapi.ts` (语音与流式文本交互), `use-billing.ts` (配额与计费逻辑)。

## 开发规范与最佳实践

### 1. 语言要求
- **中文优先**：所有的 UI 界面文本、提示语、代码注释、以及 AI 代理的回复，**必须完全使用中文**。
- **设计稿翻译**：参考设计稿或外部输入时的英文文本应主动翻译为中文。

### 2. Next.js 规范 (App Router)
- 遵循 App Router 规范，所有的路由定义在 `app/` 目录下。
- 区分 Client Components 与 Server Components。使用 `use client` 指令明确声明客户端组件，特别是包含 hooks（如 `useVapi`）或事件监听器的组件。
- 采用 Server Actions 处理表单提交与数据库交互，放置在 `lib/actions/` 中。

### 3. 数据与模型 (Mongoose)
- Next.js 热重载环境下多次连接数据库易导致报错。所有的 Mongoose 模型在导出时必须采用“单例模式”，即：`models.ModelName || model('ModelName', schema)`。
- 注意处理连接池复用问题（`mongoose.ts` 内部使用全局缓存）。

### 4. 样式 (Tailwind CSS v4)
- 项目使用的是最新的 **Tailwind CSS v4**。请留意新版语法（如：使用 `border-(--border-medium)` 替代 `border-[var(--border-medium)]`）。
- 样式合并统一使用 `cn()` 工具函数（基于 `clsx` 和 `tailwind-merge`），以防样式冲突。

### 5. 第三方集成注意事项
- **Clerk**: 所有需要授权的操作需结合 `auth()` (Server 端) 或 `useAuth` (Client 端) 获取 `userId` 进行权限校验，计费相关配额存储于用户的 Metadata 中。
- **Vapi**: 客户端语音控制和实时转录通过 `useVapi` hook 集中管理。Vapi 工具调用在 `/api/vapi/...` 等路由中进行处理。
- **Vercel Blob**: PDF 以及生成的书籍封面等静态资源需持久化上传到 Vercel Blob，避免前端内存泄漏（参考 `parsePDFFile` 需在 `finally` 中销毁 `pdfDocument`）。

### 6. 代码质量与错误处理
- 关键服务（如上传、第三方 API）必须通过 try/catch 捕获异常，并使用 `sonner` 给出友好的中文错误提示。
- 不要使用可能导致应用崩溃的硬抛出错误（Throwing exceptions that crash the UI），而是应该优雅降级或通过 UI 提供指导性反馈。
