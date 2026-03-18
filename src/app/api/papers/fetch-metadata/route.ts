import { NextRequest, NextResponse } from "next/server";
import type { ApiError } from "@/types";

interface PaperMetadata {
  title: string | null;
  authors: string[] | null;
  abstract: string | null;
  year: number | null;
  journal: string | null;
  doi: string | null;
  url: string;
}

interface SemanticScholarPaper {
  title?: string;
  authors?: { name: string }[];
  abstract?: string;
  year?: number;
  venue?: string;
  externalIds?: { DOI?: string; ArXiv?: string };
}

interface CrossRefWork {
  title?: string[];
  author?: { given?: string; family?: string }[];
  abstract?: string;
  published?: { "date-parts"?: number[][] };
  "container-title"?: string[];
  DOI?: string;
}

type PaperIdType = "doi" | "arxiv" | "semantic";

function extractPaperId(url: string): { type: PaperIdType; id: string } | null {
  // DOI URL patterns
  const doiPatterns = [
    /doi\.org\/(.+?)(?:\?|#|$)/i,
    /dx\.doi\.org\/(.+?)(?:\?|#|$)/i,
  ];
  for (const pattern of doiPatterns) {
    const match = url.match(pattern);
    if (match) return { type: "doi", id: match[1] };
  }

  // arXiv URL patterns
  const arxivPatterns = [
    /arxiv\.org\/abs\/(\d+\.\d+)/i,
    /arxiv\.org\/pdf\/(\d+\.\d+)/i,
  ];
  for (const pattern of arxivPatterns) {
    const match = url.match(pattern);
    if (match) return { type: "arxiv", id: match[1] };
  }

  // Semantic Scholar URL
  const s2Match = url.match(/semanticscholar\.org\/paper\/[^/]*?([a-f0-9]{40})/i);
  if (s2Match) return { type: "semantic", id: s2Match[1] };

  // Plain DOI string (10.xxxx/yyyy)
  const plainDoi = url.match(/(10\.\d{4,}\/[^\s]+)/);
  if (plainDoi) return { type: "doi", id: plainDoi[1] };

  return null;
}

// Strategy 1: Semantic Scholar API (supports DOI, arXiv, S2 IDs)
async function fetchFromSemanticScholar(type: PaperIdType, id: string): Promise<PaperMetadata | null> {
  const prefix = type === "doi" ? "DOI:" : type === "arxiv" ? "ARXIV:" : "";
  const paperId = prefix + id;
  const fields = "title,authors,abstract,year,venue,externalIds";
  const apiUrl = `https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(paperId)}?fields=${fields}`;

  try {
    const res = await fetch(apiUrl, {
      headers: { "User-Agent": "BizLab/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const paper: SemanticScholarPaper = await res.json();
    return {
      title: paper.title ?? null,
      authors: paper.authors?.map((a) => a.name) ?? null,
      abstract: paper.abstract ?? null,
      year: paper.year ?? null,
      journal: paper.venue ?? null,
      doi: paper.externalIds?.DOI ?? null,
      url: "",
    };
  } catch {
    return null;
  }
}

// Strategy 2: CrossRef API (DOI only, very reliable, generous rate limits)
async function fetchFromCrossRef(doi: string): Promise<PaperMetadata | null> {
  const apiUrl = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;

  try {
    const res = await fetch(apiUrl, {
      headers: { "User-Agent": "BizLab/1.0 (mailto:bizlab@example.com)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const work: CrossRefWork = data.message;

    const authors = work.author?.map((a) => {
      const parts = [a.given, a.family].filter(Boolean);
      return parts.join(" ");
    }) ?? null;

    const year = work.published?.["date-parts"]?.[0]?.[0] ?? null;

    // CrossRef abstract often contains XML tags, strip them
    const abstract = work.abstract?.replace(/<[^>]*>/g, "") ?? null;

    return {
      title: work.title?.[0] ?? null,
      authors,
      abstract,
      year,
      journal: work["container-title"]?.[0] ?? null,
      doi: work.DOI ?? doi,
      url: "",
    };
  } catch {
    return null;
  }
}

// Strategy 3: arXiv API (arXiv papers only)
async function fetchFromArxiv(arxivId: string): Promise<PaperMetadata | null> {
  const apiUrl = `https://export.arxiv.org/api/query?id_list=${arxivId}`;

  try {
    const res = await fetch(apiUrl, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const xml = await res.text();

    // Simple XML parsing for arXiv response
    const getTag = (tag: string, text: string): string | null => {
      const match = text.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return match ? match[1].trim() : null;
    };

    const entry = getTag("entry", xml);
    if (!entry) return null;

    const title = getTag("title", entry)?.replace(/\s+/g, " ");

    // Extract all authors
    const authorMatches = [...entry.matchAll(/<author>\s*<name>([^<]+)<\/name>/g)];
    const authors = authorMatches.length > 0 ? authorMatches.map((m) => m[1].trim()) : null;

    const abstract = getTag("summary", entry)?.replace(/\s+/g, " ");

    const published = getTag("published", entry);
    const year = published ? new Date(published).getFullYear() : null;

    return {
      title: title ?? null,
      authors,
      abstract: abstract ?? null,
      year,
      journal: "arXiv",
      doi: null,
      url: "",
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json<ApiError>(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const parsed = extractPaperId(url.trim());
    if (!parsed) {
      return NextResponse.json<ApiError>(
        { error: "Could not detect DOI or arXiv ID from this URL. Supported: doi.org, arxiv.org, or plain DOI (10.xxxx/...)." },
        { status: 400 }
      );
    }

    let metadata: PaperMetadata | null = null;

    // Try Semantic Scholar first (broadest coverage)
    metadata = await fetchFromSemanticScholar(parsed.type, parsed.id);

    // Fallback: CrossRef for DOI-based lookups
    if (!metadata && parsed.type === "doi") {
      metadata = await fetchFromCrossRef(parsed.id);
    }

    // Fallback: arXiv API for arXiv papers
    if (!metadata && parsed.type === "arxiv") {
      metadata = await fetchFromArxiv(parsed.id);
    }

    if (!metadata) {
      return NextResponse.json<ApiError>(
        { error: "Paper not found. Tried Semantic Scholar, CrossRef, and arXiv APIs. Please check the URL." },
        { status: 404 }
      );
    }

    metadata.url = url.trim();

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("POST /api/papers/fetch-metadata error:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch metadata. Please try again later." },
      { status: 500 }
    );
  }
}
