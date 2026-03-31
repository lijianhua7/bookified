"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

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
  pdfFile: z.any().refine((file) => file, "请选择一本 PDF 文件"),
  coverImage: z.any().optional(),
  title: z.string().min(1, "标题是必填项"),
  author: z.string().min(1, "作者是必填项"),
  voice: z.string().min(1, "请选择一个语音"),
});

export default function UploadForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfFilename, setPdfFilename] = useState<string | null>(null);
  const [coverFilename, setCoverFilename] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      voice: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log("Form Submitted:", values);
    }, 2000);
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
