import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { Paper } from "@/types";

interface PaperCardProps {
  paper: Paper;
}

export default function PaperCard({ paper }: PaperCardProps) {
  return (
    <Link href={`/papers/${paper.id}`} className="block group">
      <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {paper.title}
        </h3>

        <p className="mt-1 text-sm text-gray-600">
          {paper.authors.join(", ")}
          {paper.year && <span className="text-gray-400"> ({paper.year})</span>}
        </p>

        {paper.journal && (
          <p className="mt-1 text-sm text-gray-500 italic">{paper.journal}</p>
        )}

        {paper.abstract && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-3">
            {paper.abstract}
          </p>
        )}

        {paper.keywords && paper.keywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {paper.keywords.map((keyword) => (
              <Badge key={keyword} text={keyword} />
            ))}
          </div>
        )}
      </article>
    </Link>
  );
}
