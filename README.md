# 📚 Bookify (你的智能图书馆)

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk" />
  <img src="https://img.shields.io/badge/Vapi-000000?style=for-the-badge" alt="Vapi" />
  <img src="https://img.shields.io/badge/CodeRabbit-FF6B00?style=for-the-badge" alt="CodeRabbit" />
</div>

将你的书籍转化为交互式 AI 对话。倾听、学习，畅聊你最爱的读物！

**🌐 在线访问：** [https://bookified-ten-phi.vercel.app/](https://bookified-ten-phi.vercel.app/)

---

## 🌟 核心功能

1. **PDF 智能解析**：上传本地 PDF 格式书籍，自动解析文本内容，并抓取首部分作为图书封面。
2. **AI 语音对话 (Vapi)**：基于上传的图书内容，使用 Vapi 提供的强大能力进行实时的 AI 语音交互，让书籍“活”起来。
3. **全文检索**：支持对本地图书馆按书名或作者进行关键字全文检索。
4. **订阅与计费控制**：无缝集成 Clerk 服务来管理用户身份以及额度配额（Quota），对用户上传及使用次数做出智能订阅规划。
5. **精美现代 UI**：采用最新的 Tailwind CSS 与 shadcn/ui 结合构建的现代沉浸式界面。

---

## 🛠️ 致敬所使用的技术栈

本项目在开发过程中，深受现代 Web 生态体系的滋养，特此向以下优秀的开源项目及云服务致敬：

### 核心框架 & 库
- **[Next.js (v16.2)](https://nextjs.org)**：作为项目的基础元框架，使用最新的 App Router 结合 Server Actions 为前后端提供极致体验。
- **[React (v19)](https://react.dev/)**：用于构建用户界面的基石，并搭配最新的特性提升性能。
- **[TypeScript](https://www.typescriptlang.org/)**：为项目提供强大的静态类型检查，确保代码健壮性。

### 数据库 & 云存储
- **[MongoDB](https://www.mongodb.com/)** & **[Mongoose](https://mongoosejs.com/)**：负责海量图书数据以及切片（Segments）的高效存储与检索。
- **[Vercel Blob](https://vercel.com/docs/storage/vercel-blob)**：提供极为便捷且高速的对象存储服务，用于保存图书封面和用户文件。

### 身份认证 & 服务集成
- **[Clerk](https://clerk.com/)**：提供开箱即用的、安全的现代用户身份认证与登录系统体验，并被用于实现基于用户的额度配额限制。
- **[Vapi](https://vapi.ai/)**：革命性的 Voice AI API，极低延迟的语音 AI 交互服务（@vapi-ai/web），为应用带来了充满生命力的对话功能。

### UI & 样式系统
- **[Tailwind CSS (v4)](https://tailwindcss.com/)**：原子化 CSS 框架，极大加速了页面的开发和响应式布局调整。
- **[shadcn/ui](https://ui.shadcn.com/)**：美观且完全可控的组件库基建。
- **[Radix UI](https://www.radix-ui.com/)** & **[Base UI](https://base-ui.com/)**：无样式的底层组件，提供了绝佳的无障碍访问（a11y）支持。
- **[Lucide React](https://lucide.dev/)**：提供一致、优雅且高度可定制的图标。
- **[Sonner](https://sonner.emilkowal.ski/)**：现代化的高亮 Toast 吐司提示组件。

### 表单 & 工具链
- **[React Hook Form](https://react-hook-form.com/)** & **[Zod](https://zod.dev/)**：共同打造了类型安全、性能优越的无控表单处理与验证逻辑。
- **[PDF.js](https://mozilla.github.io/pdf.js/)**：由 Mozilla 提供支持的核心库（pdfjs-dist），在客户端优雅地完成 PDF 文档的渲染和文本内容提取。
- **clsx** & **tailwind-merge**：动态管理 Tailwind 样式的必备利器。

---

## 🚀 本地运行开发环境

首先，克隆仓库并安装依赖项：

```bash
npm install
# or
yarn install
# or
pnpm install
```

然后，在根目录创建 `.env.local` 文件，配置所需的第三方环境变量（如 Clerk, Vapi, Vercel Blob, MongoDB URI）。

最后，启动开发服务器：

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

使用浏览器打开 [http://localhost:3000](http://localhost:3000) 即可预览。

---

## ☁️ 部署说明

本项目部署在 [Vercel](https://vercel.com/) 平台上，这也是 Next.js 应用的最佳托管环境。
- 体验地址：[https://bookified-ten-phi.vercel.app/](https://bookified-ten-phi.vercel.app/)

> ✨ _Made with modern web technologies._
