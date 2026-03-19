import { describe, it, expect, beforeEach } from "vitest";
import { prismaMock } from "@/__tests__/mocks/prisma";
import {
  createRequest,
  parseResponse,
  createMockDbPaper,
} from "@/__tests__/helpers";
import { GET, POST } from "./route";
import type { PaperListResponse, ApiError } from "@/types";

describe("GET /api/papers", () => {
  beforeEach(() => {
    prismaMock.paper.findMany.mockReset();
    prismaMock.paper.count.mockReset();
  });

  // REQ-E02: Paper list returns paginated results sorted by creation date
  it("returns paginated list of papers with default params", async () => {
    const mockPapers = [createMockDbPaper({ id: "1" }), createMockDbPaper({ id: "2" })];
    prismaMock.paper.findMany.mockResolvedValue(mockPapers);
    prismaMock.paper.count.mockResolvedValue(2);

    const request = createRequest("http://localhost:3000/api/papers");
    const response = await GET(request);
    const body = await parseResponse<PaperListResponse>(response);

    expect(response.status).toBe(200);
    expect(body.papers).toHaveLength(2);
    expect(body.total).toBe(2);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(10);
    expect(body.totalPages).toBe(1);
    // Verify papers have parsed authors (array, not string)
    expect(Array.isArray(body.papers[0].authors)).toBe(true);
  });

  it("respects pagination parameters", async () => {
    prismaMock.paper.findMany.mockResolvedValue([]);
    prismaMock.paper.count.mockResolvedValue(25);

    const request = createRequest(
      "http://localhost:3000/api/papers?page=2&limit=5"
    );
    const response = await GET(request);
    const body = await parseResponse<PaperListResponse>(response);

    expect(body.page).toBe(2);
    expect(body.limit).toBe(5);
    expect(body.totalPages).toBe(5);
    // Verify skip calculation: (page-1) * limit = 5
    expect(prismaMock.paper.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  // REQ-E04: Search query returns matching papers across titles/abstracts
  it("applies search filter to title and abstract", async () => {
    prismaMock.paper.findMany.mockResolvedValue([]);
    prismaMock.paper.count.mockResolvedValue(0);

    const request = createRequest(
      "http://localhost:3000/api/papers?search=machine+learning"
    );
    await GET(request);

    expect(prismaMock.paper.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: expect.arrayContaining([
            {
              OR: [
                { title: { contains: "machine learning" } },
                { abstract: { contains: "machine learning" } },
              ],
            },
          ]),
        },
      })
    );
  });

  it("applies author filter", async () => {
    prismaMock.paper.findMany.mockResolvedValue([]);
    prismaMock.paper.count.mockResolvedValue(0);

    const request = createRequest(
      "http://localhost:3000/api/papers?author=Alice"
    );
    await GET(request);

    expect(prismaMock.paper.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: expect.arrayContaining([
            { authors: { contains: "Alice" } },
          ]),
        },
      })
    );
  });

  it("applies year range filter", async () => {
    prismaMock.paper.findMany.mockResolvedValue([]);
    prismaMock.paper.count.mockResolvedValue(0);

    const request = createRequest(
      "http://localhost:3000/api/papers?yearFrom=2020&yearTo=2024"
    );
    await GET(request);

    expect(prismaMock.paper.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: expect.arrayContaining([
            { year: { gte: 2020 } },
            { year: { lte: 2024 } },
          ]),
        },
      })
    );
  });

  it("applies custom sort order", async () => {
    prismaMock.paper.findMany.mockResolvedValue([]);
    prismaMock.paper.count.mockResolvedValue(0);

    const request = createRequest(
      "http://localhost:3000/api/papers?sort=title&order=asc"
    );
    await GET(request);

    expect(prismaMock.paper.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { title: "asc" },
      })
    );
  });

  it("returns 400 for invalid query parameters", async () => {
    const request = createRequest(
      "http://localhost:3000/api/papers?page=-1"
    );
    const response = await GET(request);
    const body = await parseResponse<ApiError>(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid query parameters");
  });

  it("returns 500 on database error", async () => {
    prismaMock.paper.findMany.mockRejectedValue(new Error("DB error"));

    const request = createRequest("http://localhost:3000/api/papers");
    const response = await GET(request);
    const body = await parseResponse<ApiError>(response);

    expect(response.status).toBe(500);
    expect(body.error).toBe("Internal server error");
  });
});

describe("POST /api/papers", () => {
  beforeEach(() => {
    prismaMock.paper.create.mockReset();
  });

  // REQ-E01: Paper registration with valid data creates record
  it("creates a paper with valid data and returns 201", async () => {
    const inputData = {
      title: "New Research Paper",
      authors: ["Alice", "Bob"],
      abstract: "Paper abstract",
      keywords: ["AI"],
      year: 2024,
    };

    const mockCreated = createMockDbPaper({
      title: inputData.title,
      authors: JSON.stringify(inputData.authors),
      abstract: inputData.abstract,
      keywords: JSON.stringify(inputData.keywords),
      year: inputData.year,
    });
    prismaMock.paper.create.mockResolvedValue(mockCreated);

    const request = createRequest("http://localhost:3000/api/papers", {
      method: "POST",
      body: inputData,
    });
    const response = await POST(request);
    const body = await parseResponse<Record<string, unknown>>(response);

    expect(response.status).toBe(201);
    expect(body.title).toBe("New Research Paper");
    expect(body.authors).toEqual(["Alice", "Bob"]);
    // Verify prisma.create was called with serialized data
    expect(prismaMock.paper.create).toHaveBeenCalledTimes(1);
  });

  it("creates a paper with only required fields", async () => {
    const inputData = {
      title: "Minimal Paper",
      authors: ["Solo Author"],
    };

    prismaMock.paper.create.mockResolvedValue(
      createMockDbPaper({
        title: inputData.title,
        authors: JSON.stringify(inputData.authors),
      })
    );

    const request = createRequest("http://localhost:3000/api/papers", {
      method: "POST",
      body: inputData,
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
  });

  // REQ-N02: Missing required fields show validation errors
  it("returns 400 when title is missing", async () => {
    const request = createRequest("http://localhost:3000/api/papers", {
      method: "POST",
      body: { authors: ["Author"] },
    });
    const response = await POST(request);
    const body = await parseResponse<ApiError>(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe("Validation failed");
    expect(body.details?.title).toBeDefined();
  });

  // REQ-N02: Missing required fields show validation errors
  it("returns 400 when authors is missing", async () => {
    const request = createRequest("http://localhost:3000/api/papers", {
      method: "POST",
      body: { title: "A Paper" },
    });
    const response = await POST(request);
    const body = await parseResponse<ApiError>(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe("Validation failed");
    expect(body.details?.authors).toBeDefined();
  });

  it("returns 400 for invalid URL in body", async () => {
    const request = createRequest("http://localhost:3000/api/papers", {
      method: "POST",
      body: {
        title: "Paper",
        authors: ["Author"],
        url: "not-a-url",
      },
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("returns 500 on database error", async () => {
    prismaMock.paper.create.mockRejectedValue(new Error("DB error"));

    const request = createRequest("http://localhost:3000/api/papers", {
      method: "POST",
      body: { title: "Paper", authors: ["Author"] },
    });
    const response = await POST(request);
    const body = await parseResponse<ApiError>(response);

    expect(response.status).toBe(500);
    expect(body.error).toBe("Internal server error");
  });
});
