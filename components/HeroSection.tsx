import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="library-hero-card mb-10 md:mb-16">
      <div className="library-hero-content">
        {/* 左侧：标题 + 说明 + 按钮 */}
        <div className="library-hero-text">
          <h1 className="library-hero-title">你的图书馆</h1>
          <p className="library-hero-description">
            将你的书籍转化为交互式 AI 对话。
            <br />
            倾听、学习，畅聊你最爱的读物。
          </p>
          <Link href="/books/new" className="library-cta-primary">
            <span className="text-lg">+</span> 添加新书
          </Link>
        </div>

        {/* 中间：插图（移动端 + 桌面端） */}
        <div className="library-hero-illustration">
          <Image
            src="/assets/hero-illustration.png"
            alt="古书与地球仪插图"
            width={300}
            height={250}
            className="object-contain"
          />
        </div>
        <div className="library-hero-illustration-desktop">
          <Image
            src="/assets/hero-illustration.png"
            alt="古书与地球仪插图"
            width={400}
            height={320}
            className="object-contain"
          />
        </div>

        {/* 右侧：步骤卡片 */}
        <div className="library-steps-card">
          <div className="flex flex-col gap-4">
            {/* 步骤 1 */}
            <div className="library-step-item">
              <div className="library-step-number">1</div>
              <div>
                <p className="library-step-title">上传 PDF</p>
                <p className="library-step-description">添加你的书籍文件</p>
              </div>
            </div>
            {/* 步骤 2 */}
            <div className="library-step-item">
              <div className="library-step-number">2</div>
              <div>
                <p className="library-step-title">AI 处理</p>
                <p className="library-step-description">我们分析书籍内容</p>
              </div>
            </div>
            {/* 步骤 3 */}
            <div className="library-step-item">
              <div className="library-step-number">3</div>
              <div>
                <p className="library-step-title">语音聊天</p>
                <p className="library-step-description">与 AI 讨论书籍</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
