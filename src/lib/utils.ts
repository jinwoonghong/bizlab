export function parsePaperFromDb(paper: {
  id: string;
  title: string;
  authors: string;
  abstract: string | null;
  keywords: string | null;
  url: string | null;
  year: number | null;
  journal: string | null;
  doi: string | null;
  volume: string | null;
  pages: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...paper,
    authors: JSON.parse(paper.authors) as string[],
    keywords: paper.keywords ? (JSON.parse(paper.keywords) as string[]) : null,
  };
}

export function serializePaperForDb(data: {
  authors?: string[];
  keywords?: string[] | null;
  [key: string]: unknown;
}) {
  const result: Record<string, unknown> = { ...data };
  if (data.authors) {
    result.authors = JSON.stringify(data.authors);
  }
  if (data.keywords !== undefined) {
    result.keywords = data.keywords ? JSON.stringify(data.keywords) : null;
  }
  return result;
}
