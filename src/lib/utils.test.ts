import { describe, it, expect } from "vitest";
import { parsePaperFromDb, serializePaperForDb } from "./utils";

describe("parsePaperFromDb", () => {
  it("parses JSON-serialized authors back to array", () => {
    const dbPaper = {
      id: "1",
      title: "Test",
      authors: JSON.stringify(["Alice", "Bob"]),
      abstract: null,
      keywords: null,
      url: null,
      year: null,
      journal: null,
      doi: null,
      volume: null,
      pages: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = parsePaperFromDb(dbPaper);
    expect(result.authors).toEqual(["Alice", "Bob"]);
    expect(Array.isArray(result.authors)).toBe(true);
  });

  it("parses JSON-serialized keywords back to array", () => {
    const dbPaper = {
      id: "1",
      title: "Test",
      authors: JSON.stringify(["Author"]),
      abstract: null,
      keywords: JSON.stringify(["AI", "ML"]),
      url: null,
      year: null,
      journal: null,
      doi: null,
      volume: null,
      pages: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = parsePaperFromDb(dbPaper);
    expect(result.keywords).toEqual(["AI", "ML"]);
  });

  it("returns null keywords when database value is null", () => {
    const dbPaper = {
      id: "1",
      title: "Test",
      authors: JSON.stringify(["Author"]),
      abstract: null,
      keywords: null,
      url: null,
      year: null,
      journal: null,
      doi: null,
      volume: null,
      pages: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = parsePaperFromDb(dbPaper);
    expect(result.keywords).toBeNull();
  });

  it("preserves all other fields unchanged", () => {
    const now = new Date();
    const dbPaper = {
      id: "abc",
      title: "My Paper",
      authors: JSON.stringify(["Author"]),
      abstract: "Abstract text",
      keywords: null,
      url: "https://example.com",
      year: 2024,
      journal: "Nature",
      doi: "10.1234/test",
      volume: "42",
      pages: "1-10",
      createdAt: now,
      updatedAt: now,
    };
    const result = parsePaperFromDb(dbPaper);
    expect(result.id).toBe("abc");
    expect(result.title).toBe("My Paper");
    expect(result.abstract).toBe("Abstract text");
    expect(result.url).toBe("https://example.com");
    expect(result.year).toBe(2024);
  });
});

describe("serializePaperForDb", () => {
  it("serializes authors array to JSON string", () => {
    const data = { authors: ["Alice", "Bob"], title: "Paper" };
    const result = serializePaperForDb(data);
    expect(result.authors).toBe(JSON.stringify(["Alice", "Bob"]));
  });

  it("serializes keywords array to JSON string", () => {
    const data = { keywords: ["AI", "ML"] };
    const result = serializePaperForDb(data);
    expect(result.keywords).toBe(JSON.stringify(["AI", "ML"]));
  });

  it("sets keywords to null when explicitly null", () => {
    const data = { keywords: null, title: "Paper" };
    const result = serializePaperForDb(data);
    expect(result.keywords).toBeNull();
  });

  it("preserves fields that are not arrays", () => {
    const data = { title: "Paper", year: 2024 };
    const result = serializePaperForDb(data);
    expect(result.title).toBe("Paper");
    expect(result.year).toBe(2024);
  });

  it("does not modify authors if not provided", () => {
    const data = { title: "Updated Title" };
    const result = serializePaperForDb(data);
    expect(result.authors).toBeUndefined();
    expect(result.title).toBe("Updated Title");
  });
});
