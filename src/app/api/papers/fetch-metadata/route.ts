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

function isGoogleScholarUrl(url: string): boolean {
  return /scholar\.google\./i.test(url);
}

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

// Fetch paper title from Google Scholar page and search via Semantic Scholar
async function fetchFromGoogleScholar(url: string): Promise<PaperMetadata | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Try to extract DOI from the page first
    const doiMatch = html.match(/10\.\d{4,}\/[^\s"'<&]+/);
    if (doiMatch) {
      const doiId = doiMatch[0].replace(/[.,;)}\]]+$/, "");
      const metadata = await fetchFromSemanticScholar("doi", doiId);
      if (metadata) return metadata;
      const crossRefMeta = await fetchFromCrossRef(doiId);
      if (crossRefMeta) return crossRefMeta;
    }

    // Extract title from the page
    let title: string | null = null;

    // Try <meta> citation tags (Google Scholar uses these)
    const citationTitle = html.match(/<meta\s+name="citation_title"\s+content="([^"]+)"/i);
    if (citationTitle) {
      title = citationTitle[1];
    }

    // Fallback: extract from <title> tag (format: "Paper Title - Google Scholar")
    if (!title) {
      const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleTag) {
        title = titleTag[1]
          .replace(/\s*[-–—]\s*Google\s+Scholar.*$/i, "")
          .replace(/\s*[-–—]\s*Google\s+학술검색.*$/i, "")
          .trim();
      }
    }

    if (!title || title.length < 5) return null;

    // Search Semantic Scholar by title
    const searchUrl = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(title)}&limit=1&fields=title,authors,abstract,year,venue,externalIds`;
    const searchRes = await fetch(searchUrl, {
      headers: { "User-Agent": "BizLab/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const paper: SemanticScholarPaper = searchData.data?.[0];
    if (!paper) return null;

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

    const trimmedUrl = url.trim();
    let metadata: PaperMetadata | null = null;

    // Google Scholar URL: scrape page for title/DOI, then search
    if (isGoogleScholarUrl(trimmedUrl)) {
      metadata = await fetchFromGoogleScholar(trimmedUrl);
      if (!metadata) {
        return NextResponse.json<ApiError>(
          { error: "Google Scholar 페이지에서 논문 정보를 추출하지 못했습니다. DOI 또는 arXiv 링크를 직접 입력해보세요." },
          { status: 404 }
        );
      }
      metadata.url = trimmedUrl;
      return NextResponse.json(metadata);
    }

    const parsed = extractPaperId(trimmedUrl);
    if (!parsed) {
      return NextResponse.json<ApiError>(
        { error: "URL에서 DOI 또는 arXiv ID를 감지하지 못했습니다. 지원: doi.org, arxiv.org, Google Scholar 링크, 또는 DOI 직접 입력 (10.xxxx/...)" },
        { status: 400 }
      );
    }

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
        { error: "논문을 찾지 못했습니다. Semantic Scholar, CrossRef, arXiv API를 모두 시도했습니다. URL을 확인해주세요." },
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
