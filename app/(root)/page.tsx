import BookCard from "@/components/BookCard";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import { getAllBooks } from "@/lib/actions/book.actions";

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const query = typeof params?.q === 'string' ? params.q : undefined;
  
  const bookResult = await getAllBooks(query);
  const books = bookResult.success ? bookResult.data ?? [] : [];

  return (
    <main className="container wrapper">
      <HeroSection />

      <div className="flex flex-col md:flex-row md:items-center justify-between mt-8 mb-6 gap-4">
        <h2 className="text-2xl font-bold text-[#4D3E35]">最近阅读</h2>
        <div className="w-full md:w-auto md:min-w-[300px]">
          <SearchBar />
        </div>
      </div>

      {books.length > 0 ? (
        <div className="library-books-grid">
          {books.map((book) => (
            <BookCard
              key={book._id}
              title={book.title}
              author={book.author}
              slug={book.slug}
              coverURL={book.coverURL}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          {query ? "没有找到匹配的图书，请尝试其他关键词" : "目前没有任何图书"}
        </div>
      )}
    </main>
  );
}
