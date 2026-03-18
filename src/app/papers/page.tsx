import { prisma } from "@/lib/prisma";
import { parsePaperFromDb } from "@/lib/utils";
import PapersPageClient from "./PapersPageClient";

interface PapersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PapersPage({ searchParams }: PapersPageProps) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  const limit = 10;
  const search = typeof params.search === "string" ? params.search : undefined;
  const author = typeof params.author === "string" ? params.author : undefined;
  const keyword = typeof params.keyword === "string" ? params.keyword : undefined;
  const yearFrom = params.yearFrom ? Number(params.yearFrom) : undefined;
  const yearTo = params.yearTo ? Number(params.yearTo) : undefined;

  const where: Record<string, unknown>[] = [];

  if (search) {
    where.push({
      OR: [
        { title: { contains: search } },
        { abstract: { contains: search } },
      ],
    });
  }

  if (author) {
    where.push({ authors: { contains: author } });
  }

  if (keyword) {
    where.push({ keywords: { contains: keyword } });
  }

  if (yearFrom !== undefined && !isNaN(yearFrom)) {
    where.push({ year: { gte: yearFrom } });
  }

  if (yearTo !== undefined && !isNaN(yearTo)) {
    where.push({ year: { lte: yearTo } });
  }

  const whereClause = where.length > 0 ? { AND: where } : {};

  const [papersRaw, total] = await Promise.all([
    prisma.paper.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.paper.count({ where: whereClause }),
  ]);

  const papers = papersRaw.map(parsePaperFromDb);
  const totalPages = Math.ceil(total / limit);

  return (
    <PapersPageClient
      papers={papers}
      currentPage={page}
      totalPages={totalPages}
      total={total}
      initialSearch={search ?? ""}
      initialFilters={{
        author: author ?? "",
        keyword: keyword ?? "",
        yearFrom: yearFrom ? String(yearFrom) : "",
        yearTo: yearTo ? String(yearTo) : "",
      }}
    />
  );
}
