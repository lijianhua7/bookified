import BookCard from "@/components/BookCard";
import HeroSection from "@/components/HeroSection";
import { sampleBooks } from "@/lib/constants";

export default function Page() {
  return (
    <div className="container wrapper">
      <HeroSection />

      <div className="library-books-grid">
        {sampleBooks.map((book) => (
          <BookCard
            key={book._id}
            title={book.title}
            author={book.author}
            slug={book.slug}
            coverURL={book.coverURL}
          />
        ))}
      </div>
    </div>
  );
}
