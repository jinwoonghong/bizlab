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

  // Publisher-specific URL patterns → DOI extraction
  const publisherPatterns: [RegExp, string][] = [
    // Nature: nature.com/articles/s41586-019-1138-y(.pdf)
    [/nature\.com\/articles\/(s\d+[-\w]+?)(?:\.pdf|\.html)?(?:\?|#|$)/i, "10.1038/$1"],
    // ACM: dl.acm.org/doi(/pdf)/10.1145/xxxxx
    [/dl\.acm\.org\/doi\/(?:pdf\/|abs\/|full\/)?(10\.\d{4,}\/[^\s?#]+)/i, "$1"],
    // Springer: link.springer.com/article/10.1007/xxxxx or /content/pdf/10.1007/xxxxx.pdf
    [/link\.springer\.com\/(?:article|chapter|content\/pdf)\/(10\.\d{4,}\/[^\s?#.]+)/i, "$1"],
    // Wiley: onlinelibrary.wiley.com/doi(/pdf)/10.xxxx/xxxxx
    [/onlinelibrary\.wiley\.com\/doi\/(?:pdf\/|abs\/|full\/)?(10\.\d{4,}\/[^\s?#]+)/i, "$1"],
    // ScienceDirect/Elsevier: doi embedded in redirects
    [/sciencedirect\.com\/science\/article\/(?:pii|abs)\/(S\d{15,})/i, "pii:$1"],
    // IEEE: ieeexplore.ieee.org/document/12345 or /stamp/stamp.jsp?arnumber=12345
    [/ieeexplore\.ieee\.org\/(?:document|stamp\/stamp\.jsp\?(?:tp=&)?arnumber=)(\d+)/i, "ieee:$1"],
    // PLOS: journals.plos.org/plosone/article?id=10.1371/xxxxx
    [/plos\.org\/\w+\/article\?id=(10\.\d{4,}\/[^\s&#]+)/i, "$1"],
    // MDPI: mdpi.com/xxxx-xxxx/x/x/xxx or mdpi.com/xxxx-xxxx/x/x/xxx/pdf
    [/mdpi\.com\/(\d{4}-\d{4}\/\d+\/\d+\/\d+)/i, "mdpi:$1"],
    // Frontiers: frontiersin.org/articles/10.3389/xxxxx
    [/frontiersin\.org\/(?:articles|journals\/\w+\/articles)\/(10\.\d{4,}\/[^\s?#]+)/i, "$1"],
    // APS: journals.aps.org/prl/abstract/10.1103/xxxxx
    [/journals\.aps\.org\/\w+\/(?:abstract|pdf)\/(10\.\d{4,}\/[^\s?#]+)/i, "$1"],
    // Science: science.org/doi(/pdf)/10.1126/xxxxx
    [/science\.org\/doi\/(?:pdf\/|abs\/|full\/)?(10\.\d{4,}\/[^\s?#]+)/i, "$1"],
  ];

  for (const [pattern, template] of publisherPatterns) {
    const match = url.match(pattern);
    if (match) {
      const id = template.replace(/\$(\d)/g, (_, n) => match[Number(n)] ?? "");
      // Handle special prefixes for non-DOI identifiers
      if (id.startsWith("pii:") || id.startsWith("ieee:") || id.startsWith("mdpi:")) {
        // These will be resolved via web page scraping fallback
        break;
      }
      return { type: "doi", id: id.replace(/\.pdf$/i, "") };
    }
  }

  // Plain DOI string (10.xxxx/yyyy)
  const plainDoi = url.match(/(10\.\d{4,}\/[^\s]+)/);
  if (plainDoi) return { type: "doi", id: plainDoi[1].replace(/\.pdf$/i, "") };

  return null;
}

// Scrape any web page to extract DOI or title, then look up metadata
async function fetchFromWebPage(url: string): Promise<PaperMetadata | null> {
  try {
    // For PDF URLs, try the HTML version first
    let fetchUrl = url;
    if (/\.pdf(\?|#|$)/i.test(url)) {
      fetchUrl = url.replace(/\.pdf(\?|#|$)/i, "$1");
    }

    const fetchHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    };

    let res = await fetch(fetchUrl, {
      headers: fetchHeaders,
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    // If HTML version fails, try original URL
    if (!res.ok && fetchUrl !== url) {
      res = await fetch(url, {
        headers: fetchHeaders,
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
      });
    }
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "";
    // Skip binary content (PDFs, images, etc.)
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return null;
    }

    const html = await res.text();

    // Strategy A: Extract DOI from the page (meta tags, links, or body text)
    const doiPatterns = [
      // <meta name="citation_doi" content="10.xxxx/...">
      /<meta\s+name="citation_doi"\s+content="([^"]+)"/i,
      // <meta name="dc.identifier" content="doi:10.xxxx/...">
      /<meta\s+name="dc\.identifier"\s+content="(?:doi:)?([^"]+)"/i,
      // <meta name="DOI" content="10.xxxx/...">
      /<meta\s+name="DOI"\s+content="([^"]+)"/i,
      // <meta property="citation_doi" content="10.xxxx/...">
      /<meta\s+property="citation_doi"\s+content="([^"]+)"/i,
    ];
    for (const pattern of doiPatterns) {
      const match = html.match(pattern);
      if (match) {
        const doiId = match[1].replace(/^doi:/i, "").trim();
        if (doiId.startsWith("10.")) {
          const metadata = await fetchFromSemanticScholar("doi", doiId);
          if (metadata) return metadata;
          const crossRefMeta = await fetchFromCrossRef(doiId);
          if (crossRefMeta) return crossRefMeta;
        }
      }
    }

    // Fallback: find DOI pattern anywhere in the HTML body
    const bodyDoiMatch = html.match(/\b(10\.\d{4,}\/[^\s"'<>&]{3,})\b/);
    if (bodyDoiMatch) {
      const doiId = bodyDoiMatch[1].replace(/[.,;)}\]]+$/, "");
      const metadata = await fetchFromSemanticScholar("doi", doiId);
      if (metadata) return metadata;
      const crossRefMeta = await fetchFromCrossRef(doiId);
      if (crossRefMeta) return crossRefMeta;
    }

    // Strategy B: Extract title and search Semantic Scholar
    let title: string | null = null;

    // Try citation meta tags (used by most academic publishers)
    const citationTitle = html.match(/<meta\s+name="citation_title"\s+content="([^"]+)"/i);
    if (citationTitle) {
      title = citationTitle[1];
    }

    // Try Open Graph title
    if (!title) {
      const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
      if (ogTitle) title = ogTitle[1];
    }

    // Try dc.title (Dublin Core)
    if (!title) {
      const dcTitle = html.match(/<meta\s+name="dc\.title"\s+content="([^"]+)"/i);
      if (dcTitle) title = dcTitle[1];
    }

    // Fallback: <title> tag, strip common suffixes
    if (!title) {
      const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleTag) {
        title = titleTag[1]
          .replace(/\s*[-–—|]\s*(Google\s+Scholar|IEEE|ACM|Springer|Elsevier|ScienceDirect|Nature|Wiley|PLOS|MDPI|arXiv|학술검색).*$/i, "")
          .replace(/\s*[-–—|]\s*[A-Z][a-z]+(\s+[A-Z][a-z]+){0,3}\s*$/i, "")
          .trim();
      }
    }

    if (!title || title.length < 5) return null;

    // Decode HTML entities
    title = title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"');

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

    const parsed = extractPaperId(trimmedUrl);

    if (parsed) {
      // Known ID type: use direct API lookup
      metadata = await fetchFromSemanticScholar(parsed.type, parsed.id);

      if (!metadata && parsed.type === "doi") {
        metadata = await fetchFromCrossRef(parsed.id);
      }

      if (!metadata && parsed.type === "arxiv") {
        metadata = await fetchFromArxiv(parsed.id);
      }
    }

    // Fallback: scrape the web page for DOI or title
    if (!metadata && trimmedUrl.startsWith("http")) {
      metadata = await fetchFromWebPage(trimmedUrl);
    }

    if (!metadata) {
      return NextResponse.json<ApiError>(
        { error: "논문 정보를 찾지 못했습니다. 페이지에서 DOI나 제목을 추출할 수 없었습니다. 다른 URL을 시도해보세요." },
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
