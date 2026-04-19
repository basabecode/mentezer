import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SourceCitationProps {
  book: string;
  author: string;
  page?: number | string;
  url?: string;
  highlight?: string;
  className?: string;
}

export function SourceCitation({
  book,
  author,
  page,
  url,
  highlight,
  className,
}: SourceCitationProps) {
  const content = (
    <div className={cn("p-4 rounded-xl border border-psy-blue/20 bg-psy-blue/5", className)}>
      <div className="flex gap-3">
        <BookOpen size={16} className="flex-shrink-0 text-psy-blue mt-1" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-psy-ink">
            {book}
          </p>
          <p className="text-xs text-psy-muted mt-0.5">
            {author}
            {page && ` — p. ${page}`}
          </p>
          {highlight && (
            <blockquote className="text-xs italic text-psy-ink/70 mt-2 pl-3 border-l-2 border-psy-blue/20">
              "{highlight}"
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:no-underline transition-opacity hover:opacity-80"
      >
        {content}
      </a>
    );
  }

  return content;
}
