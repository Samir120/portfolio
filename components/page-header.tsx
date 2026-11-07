type PageHeaderProps = {
  path: string;
  title: string;
  lead?: string;
};

// The top of every inner page: a mono path, the h1, an optional lead
// paragraph, then a hairline. The path echoes the project cards' title
// bars; it is decoration, so screen readers skip it.
export function PageHeader({ path, title, lead }: PageHeaderProps) {
  return (
    <header className="border-b border-border-subtle pb-8">
      <p
        aria-hidden="true"
        className="font-mono text-xs tracking-wider text-text-muted"
      >
        {path}
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h1>
      {lead && (
        <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
          {lead}
        </p>
      )}
    </header>
  );
}
