import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parsePaperFromDb } from "@/lib/utils";
import PaperDetail from "@/components/papers/PaperDetail";
import Link from "next/link";

interface PaperDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PaperDetailPage({ params }: PaperDetailPageProps) {
  const { id } = await params;

  const paperRaw = await prisma.paper.findUnique({ where: { id } });

  if (!paperRaw) {
    notFound();
  }

  const paper = parsePaperFromDb(paperRaw);

  return (
    <div>
      <nav className="mb-6">
        <Link
          href="/papers"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Papers
        </Link>
      </nav>

      <PaperDetail paper={paper} />
    </div>
  );
}
