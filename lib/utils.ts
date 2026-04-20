import { TextSegment } from '@/type';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DEFAULT_VOICE, voiceOptions } from './constants';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 将 Mongoose 文档序列化为纯 JSON 对象（去除 ObjectId、Date 等特殊类型）
export const serializeData = <T>(data: T): T => JSON.parse(JSON.stringify(data));

// 自动生成书籍文件名称的 slug 标识
// 比如 generateSlug("The Three-Body Problem.pdf") → "the-three-body-problem"
export function generateSlug(text: string): string {
  return text
      .replace(/\.[^/.]+$/, '') // 移除文件扩展名（.pdf、.txt 等）
      .toLowerCase() // 转换为小写
      .trim() // 去除首尾空白
      .replace(/[^\w\s-]/g, '') // 移除特殊字符（保留字母、数字、空格和连字符）
      .replace(/[\s_]+/g, '-') // 将空格和下划线替换为连字符
      .replace(/^-+|-+$/g, ''); // 去除首尾多余的连字符
}

// 转义正则表达式特殊字符，防止 ReDoS 攻击
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// 将文本内容分割为段落，用于 MongoDB 存储和搜索
export const splitIntoSegments = (
    text: string,
    segmentSize: number = 500, // 每个段落的最大词数
    overlapSize: number = 50, // 段落之间重叠的词数，用于保持上下文连贯
): TextSegment[] => {
  // 校验参数，防止死循环
  if (segmentSize <= 0) {
    throw new Error('segmentSize must be greater than 0');
  }
  if (overlapSize < 0 || overlapSize >= segmentSize) {
    throw new Error('overlapSize must be >= 0 and < segmentSize');
  }

  const normalizedText = text.trim();
  const hasWhitespace = /\s/.test(normalizedText);
  const words = hasWhitespace
      ? normalizedText.split(/\s+/).filter((word) => word.length > 0)
      : Array.from(normalizedText);
  const joiner = hasWhitespace ? ' ' : '';
  const segments: TextSegment[] = [];

  let segmentIndex = 0;
  let startIndex = 0;

  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + segmentSize, words.length);
    const segmentWords = words.slice(startIndex, endIndex);
    const segmentText = segmentWords.join(joiner);

    segments.push({
      text: segmentText,
      segmentIndex,
      wordCount: segmentWords.length,
    });

    segmentIndex++;

    if (endIndex >= words.length) break;
    startIndex = endIndex - overlapSize;
  }

  return segments;
};

// 根据角色标识或语音 ID 获取语音数据
export const getVoice = (persona?: string) => {
  if (!persona) return voiceOptions[DEFAULT_VOICE];

  // 按语音 ID 查找
  const voiceEntry = Object.values(voiceOptions).find((v) => v.id === persona);
  if (voiceEntry) return voiceEntry;

  // 按 key 查找
  const voiceByKey = voiceOptions[persona as keyof typeof voiceOptions];
  if (voiceByKey) return voiceByKey;

  // 默认回退
  return voiceOptions[DEFAULT_VOICE];
};

// 将秒数格式化为 MM:SS 格式
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export async function parsePDFFile(file: File) {
  try {
    const pdfjsLib = await import('pdfjs-dist');

    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
      ).toString();
    }

    // 将文件读取为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // 加载 PDF 文档
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;

    // 渲染第一页作为封面图片
    const firstPage = await pdfDocument.getPage(1);
    const viewport = firstPage.getViewport({ scale: 2 }); // 2 倍缩放以获得更高画质

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Could not get canvas context');
    }

    await firstPage.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // 将 Canvas 转换为 Data URL
    const coverDataURL = canvas.toDataURL('image/png');

    // 从所有页面提取文本
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
          .filter((item: any) => 'str' in item)
          .map((item: { str: string; }) => (item as { str: string }).str)
          .join(' ');
      fullText += pageText + '\n';
    }

    // 将文本分割为段落，用于搜索
    const segments = splitIntoSegments(fullText);

    // 清理 PDF 文档资源
    await pdfDocument.destroy();

    return {
      content: segments,
      cover: coverDataURL,
    };
  } catch (error) {
    console.error('PDF 解析失败:', error);
    throw new Error(`PDF 文件解析失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}