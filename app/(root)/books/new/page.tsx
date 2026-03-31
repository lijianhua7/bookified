import UploadForm from "@/components/UploadForm";

export default function NewBookPage() {
  return (
    <main className="container wrapper">
      <div className="mx-auto max-w-180 space-y-10">
        <section className="flex flex-col gap-5">
          <h1 className="page-title-xl">添加新书</h1>
          <p className="subtitle">上传PDF，生成互动阅读体验</p>
        </section>
        <UploadForm />
      </div>
    </main>
  );
}
