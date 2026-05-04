"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { cn, parsePDFFile } from "@/lib/utils";
import {
  MAX_FILE_SIZE,
  ACCEPTED_PDF_TYPES,
  MAX_IMAGE_SIZE,
  ACCEPTED_IMAGE_TYPES,
} from "@/lib/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { checkBookExists, createBook, saveBookSegments } from "@/lib/actions/book.actions";
import { upload } from "@vercel/blob/client";

const VOICES = {
  male: [
    {
      id: "Dave",
      name: "戴夫 (Dave)",
      desc: "年轻男性，英伦口音，休闲对话风格",
    },
    {
      id: "Daniel",
      name: "丹尼尔 (Daniel)",
      desc: "中年男性，英伦口音，稳重且温暖",
    },
    { id: "Chris", name: "克里斯 (Chris)", desc: "男性，休闲随和" },
  ],
  female: [
    {
      id: "Rachel",
      name: "瑞秋 (Rachel)",
      desc: "年轻女性，美式口音，平静清晰",
    },
    { id: "Sarah", name: "莎拉 (Sarah)", desc: "年轻女性，美式口音，温柔亲切" },
  ],
};

const formSchema = z.object({
  title: z.string().min(1, "标题是必填项").max(100, "标题不能超过 100 个字符"),
  author: z.string().min(1, "作者是必填项").max(100, "作者名不能超过 100 个字符"),
  voice: z.string().min(1, "请选择一个语音"),
  pdfFile: z
    .instanceof(File, { message: "请选择一本 PDF 文件" })
    .refine((file) => file.size <= MAX_FILE_SIZE, "文件大小不能超过 50MB")
    .refine((file) => ACCEPTED_PDF_TYPES.includes(file.type), "仅支持 PDF 格式的文件"),
  coverImage: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= MAX_IMAGE_SIZE, "图片大小不能超过 10MB")
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "仅支持 .jpg、.jpeg、.png 和 .webp 格式的图片",
    ),
});

export default function UploadForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfFilename, setPdfFilename] = useState<string | null>(null);
  const [coverFilename, setCoverFilename] = useState<string | null>(null);
  const { userId } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      voice: "",
      pdfFile: undefined,
      coverImage: undefined,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    // 检查用户是否登录
    if (!userId) {
      return toast.error("上传图书前请先登录！");
    }

    setIsLoading(true);

    // PostHog -> Track Book Uploads ...

    try {
      // 检查图书是否已存在
      const existsCheck = await checkBookExists(data.title);
      if (existsCheck.exists && existsCheck.book) {
        toast.info("同名的图书已存在！");
        // 清空表单
        form.reset();
        // 已存在就跳转到该图书的详情页面
        router.push(`/books/${existsCheck.book.slug}`);
        return;
      }

      // 格式化文件名
      const fileTitle = data.title.replace(/\s+/g, "-").toLowerCase();
      // 解析 PDF 文件
      const pdfFile = data.pdfFile;
      const parsedPdf = await parsePDFFile(pdfFile);
      if (parsedPdf.content.length === 0) {
        toast.error("无法解析 PDF 文件，请上传有效的 PDF 文件！");
        return;
      }

      // 上传pdf
      const uploadedPdfBlob = await upload(fileTitle, pdfFile, {
        access: "public",
        handleUploadUrl: "/api/upload",
        contentType: "application/pdf",
      })

      // 上传封面
      let coverUrl: string;

      if (data.coverImage) {
        const coverFile = data.coverImage;
        const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, coverFile, {
          access: "public",
          handleUploadUrl: "/api/upload",
          contentType: coverFile.type,
        })
        coverUrl = uploadedCoverBlob.url;
      } else {
        const response = await fetch(parsedPdf.cover);
        const blob = await response.blob();

        const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, blob, {
          access: "public",
          handleUploadUrl: "/api/upload",
          contentType: "image/png",
        })
        coverUrl = uploadedCoverBlob.url;
      }

      // 创建图书
      const book = await createBook({
        clerkId: userId,
        title: data.title,
        author: data.author,
        persona: data.voice,
        fileURL: uploadedPdfBlob.url,
        fileBlobKey: uploadedPdfBlob.pathname,
        coverURL: coverUrl,
        fileSize: pdfFile.size,
      })

      // 创建失败
      if (!book.success) {
        if (book.isBillingError) {
          toast.error(book.error as string || "您已达到当前订阅计划的上限，请升级计划以继续上传。");
          router.push('/subscriptions');
          return;
        }
        throw new Error(book.error as string || "创建图书失败");
      }

      // 创建的图书已存在
      if (book.alreadyExists) {
        toast.info("同名的图书已存在！");
        // 清空表单
        form.reset();
        // 已存在就跳转到该图书的详情页面
        router.push(`/books/${book.data.slug}`);
        return;
      }

      // 创建成功
      // 保存图书片段
      const segments = await saveBookSegments(
        book.data._id,
        userId,
        parsedPdf.content,
      )

      if (!segments.success) {
        toast.error("保存图书片段失败，请稍后再试。");
        throw new Error("保存图书片段失败");
      }

      toast.success("图书创建成功！");
      // 清空表单
      form.reset();
      // 创建新书成功跳转到首页
      router.push(`/`);

    } catch (e) {
      console.error(e);
      toast.error("上传图书失败，请稍后重试！");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="new-book-wrapper">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* PDF File */}
            <FormField
              control={form.control}
              name="pdfFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">书籍 PDF 文件</FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        "upload-dropzone border-2 border-dashed border-[#d4c4a8]",
                        pdfFilename ? "upload-dropzone-uploaded" : "",
                      )}
                      onClick={() =>
                        document.getElementById("pdf-upload")?.click()
                      }
                    >
                      <input
                        id="pdf-upload"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                            setPdfFilename(file.name);
                          }
                        }}
                      />
                      {pdfFilename ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="upload-dropzone-text">
                            {pdfFilename}
                          </span>
                          <div
                            className="upload-dropzone-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              field.onChange(undefined);
                              setPdfFilename(null);
                              const input = document.getElementById(
                                "pdf-upload",
                              ) as HTMLInputElement;
                              if (input) input.value = "";
                            }}
                          >
                            <X size={20} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="upload-dropzone-icon" />
                          <span className="upload-dropzone-text">
                            点击上传 PDF
                          </span>
                          <span className="upload-dropzone-hint">
                            PDF 文件（最大 50MB）
                          </span>
                        </>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cover Image */}
            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">封面图片（可选）</FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        "upload-dropzone border-2 border-dashed border-[#d4c4a8]",
                        coverFilename ? "upload-dropzone-uploaded" : "",
                      )}
                      onClick={() =>
                        document.getElementById("cover-upload")?.click()
                      }
                    >
                      <input
                        id="cover-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                            setCoverFilename(file.name);
                          }
                        }}
                      />
                      {coverFilename ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="upload-dropzone-text">
                            {coverFilename}
                          </span>
                          <div
                            className="upload-dropzone-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              field.onChange(undefined);
                              setCoverFilename(null);
                              const input = document.getElementById(
                                "cover-upload",
                              ) as HTMLInputElement;
                              if (input) input.value = "";
                            }}
                          >
                            <X size={20} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="upload-dropzone-icon" />
                          <span className="upload-dropzone-text">
                            点击上传封面图片
                          </span>
                          <span className="upload-dropzone-hint">
                            留空以从 PDF 自动生成
                          </span>
                        </>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">标题</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例如：富爸爸穷爸爸"
                      className="form-input border border-(--border-subtle) shadow-(--shadow-soft-sm)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Author */}
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">作者姓名</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例如：罗伯特·清崎"
                      className="form-input border border-(--border-subtle) shadow-(--shadow-soft-sm)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Voice Selector */}
            <FormField
              control={form.control}
              name="voice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">选择助手语音</FormLabel>
                  <FormControl>
                    <div className="space-y-6">
                      {/* Male Voices */}
                      <div className="space-y-3">
                        <span className="text-sm text-(--text-secondary)">
                          男声
                        </span>
                        <div className="voice-selector-options flex-wrap md:flex-nowrap">
                          {VOICES.male.map((voice) => (
                            <div
                              key={voice.id}
                              className={cn(
                                "voice-selector-option min-w-[30%] flex-col items-start p-4",
                                field.value === voice.id
                                  ? "voice-selector-option-selected"
                                  : "voice-selector-option-default",
                              )}
                              onClick={() => field.onChange(voice.id)}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className={cn(
                                    "w-4 h-4 rounded-full border border-(--border-medium) flex items-center justify-center",
                                    field.value === voice.id &&
                                      "border-(--text-primary)",
                                  )}
                                >
                                  {field.value === voice.id && (
                                    <div className="w-2 h-2 rounded-full bg-(--text-primary)" />
                                  )}
                                </div>
                                <span className="font-bold text-(--text-primary) text-base">
                                  {voice.name}
                                </span>
                              </div>
                              <p className="text-xs text-(--text-secondary) leading-[1.4] text-left">
                                {voice.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Female Voices */}
                      <div className="space-y-3">
                        <span className="text-sm text-(--text-secondary)">
                          女声
                        </span>
                        <div className="voice-selector-options flex-wrap md:flex-nowrap">
                          {VOICES.female.map((voice) => (
                            <div
                              key={voice.id}
                              className={cn(
                                "voice-selector-option min-w-[45%] flex-col items-start p-4",
                                field.value === voice.id
                                  ? "voice-selector-option-selected"
                                  : "voice-selector-option-default",
                              )}
                              onClick={() => field.onChange(voice.id)}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className={cn(
                                    "w-4 h-4 rounded-full border border-(--border-medium) flex items-center justify-center",
                                    field.value === voice.id &&
                                      "border-(--text-primary)",
                                  )}
                                >
                                  {field.value === voice.id && (
                                    <div className="w-2 h-2 rounded-full bg-(--text-primary)" />
                                  )}
                                </div>
                                <span className="font-bold text-(--text-primary) text-base">
                                  {voice.name}
                                </span>
                              </div>
                              <p className="text-xs text-(--text-secondary) leading-[1.4] text-left">
                                {voice.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button type="submit" className="form-btn mt-4">
              开始合成
            </button>
          </form>
        </Form>
      </div>

      {isLoading && (
        <div className="loading-wrapper">
          <div className="loading-shadow-wrapper bg-white shadow-soft-lg">
            <div className="loading-shadow">
              <div className="w-16 h-16 border-4 border-dashed border-(--color-brand) rounded-full loading-animation"></div>
              <h3 className="loading-title">合成中...</h3>
              <div className="loading-progress">
                <div className="loading-progress-item text-(--text-secondary)">
                  <span>正在处理 PDF 并提取文字</span>
                  <div className="loading-progress-status"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
