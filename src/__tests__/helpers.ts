// Test helper utilities
import { NextRequest } from "next/server";

/**
 * Create a NextRequest for testing API routes.
 */
export function createRequest(
  url: string,
  options?: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  }
): NextRequest {
  const { method = "GET", body, headers = {} } = options ?? {};

  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

/**
 * Parse JSON from a NextResponse.
 */
export async function parseResponse<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

/**
 * Factory for creating mock Paper database records (with JSON-serialized arrays).
 */
export function createMockDbPaper(overrides?: Partial<Record<string, unknown>>) {
  return {
    id: "test-id-1",
    title: "Test Paper Title",
    authors: JSON.stringify(["Author One", "Author Two"]),
    abstract: "Test abstract content",
    keywords: JSON.stringify(["keyword1", "keyword2"]),
    url: "https://example.com/paper",
    year: 2024,
    journal: "Test Journal",
    doi: "10.1234/test",
    volume: "1",
    pages: "1-10",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}
