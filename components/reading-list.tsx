import { SectionHeading } from "@/components/section-heading";

type Book = { title: string; by: string; year: number };

type ReadingListProps = {
  title: string;
  id?: string;
  books: readonly Book[];
};

// The reading list as a timeline: one row per year, newest first, the year
// on the left and that year's books on the right. Titles are set in the
// sans face, like a book's cover; authors in the mono label size.
export function ReadingList({ title, id, books }: ReadingListProps) {
  const years = [...new Set(books.map((book) => book.year))].sort(
    (a, b) => b - a,
  );

  return (
    <section id={id}>
      <SectionHeading title={title} />
      <div className="mt-6 border-t border-border-subtle">
        {years.map((year) => (
          <div
            key={year}
            className="grid gap-x-6 gap-y-4 border-b border-border-subtle py-6 sm:grid-cols-[5rem_1fr]"
          >
            <h3 className="font-mono text-sm text-text-muted">{year}</h3>
            <ul className="space-y-4">
              {books
                .filter((book) => book.year === year)
                .map((book) => (
                  <li key={book.title}>
                    <p className="font-sans font-medium text-text">
                      {book.title}
                    </p>
                    <p className="mt-0.5 text-sm text-text-muted">{book.by}</p>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
