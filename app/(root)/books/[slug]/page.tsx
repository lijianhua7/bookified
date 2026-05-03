import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowLeft, MicOff, Mic } from "lucide-react";
import { getBookBySlug } from "@/lib/actions/book.actions";
import VapiControls from "@/components/VapiControls";

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // 要求登录
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { slug } = await params;

  // 根据 slug 获取图书数据
  const result = await getBookBySlug(slug);
  if (!result.success || !result.data) redirect("/");

  const book = result.data;

  return (
    <main className="book-page-container">
      {/* 浮动返回按钮 */}
      <Link href="/" className="back-btn-floating" aria-label="返回首页">
        <ArrowLeft className="icon-sm" />
      </Link>

      <VapiControls book={book} />
    </main>
  );
}
