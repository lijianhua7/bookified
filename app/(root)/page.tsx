import BookCard from "@/components/BookCard";
import HeroSection from "@/components/HeroSection";
import { getAllBooks } from "@/lib/actions/book.actions";

export default async function Page() {
  const bookResult = await getAllBooks();
  const books = bookResult.success ? bookResult.data ?? [] : [];

  return (
    <main className="container wrapper">
      <HeroSection />

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
    </main>
  );
}
