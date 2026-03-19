import { describe, it, expect } from "vitest";
import {
  createPaperSchema,
  updatePaperSchema,
  searchParamsSchema,
  verifyPasswordSchema,
} from "./validations";

describe("createPaperSchema", () => {
  it("accepts valid paper data with all fields", () => {
    const data = {
      title: "Machine Learning Advances",
      authors: ["Alice", "Bob"],
      abstract: "An overview of recent ML advances.",
      keywords: ["ML", "AI"],
      url: "https://example.com/paper",
      year: 2024,
      journal: "Nature",
      doi: "10.1234/test",
      volume: "42",
      pages: "1-15",
    };
    const result = createPaperSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Machine Learning Advances");
      expect(result.data.authors).toEqual(["Alice", "Bob"]);
    }
  });

  it("accepts valid paper data with only required fields", () => {
    const data = {
      title: "Minimal Paper",
      authors: ["Author"],
    };
    const result = createPaperSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  // REQ-N02: Missing required fields show validation errors
  it("rejects when title is missing", () => {
    const data = { authors: ["Author"] };
    const result = createPaperSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.title).toBeDefined();
    }
  });

  it("rejects when title is empty string", () => {
    const data = { title: "", authors: ["Author"] };
    const result = createPaperSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  // REQ-N02: Missing required fields show validation errors
  it("rejects when authors is missing", () => {
    const data = { title: "A Paper" };
    const result = createPaperSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.authors).toBeDefined();
    }
  });

  it("rejects when authors array is empty", () => {
    const data = { title: "A Paper", authors: [] };
    const result = createPaperSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects when author name is empty string", () => {
    const data = { title: "A Paper", authors: [""] };
    const result = createPaperSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects invalid URL format", () => {
    const data = {
      title: "Paper",
      authors: ["Author"],
      url: "not-a-valid-url",
    };
    const result = createPaperSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("accepts empty string as URL (opt-out)", () => {
    const data = {
      title: "Paper",
      authors: ["Author"],
      url: "",
    };
    const result = createPaperSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("accepts null/undefined optional fields", () => {
    const data = {
      title: "Paper",
      authors: ["Author"],
      abstract: null,
      keywords: null,
      url: null,
      year: null,
    };
    const result = createPaperSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects year outside valid range", () => {
    const tooOld = {
      title: "Paper",
      authors: ["Author"],
      year: 1800,
    };
    expect(createPaperSchema.safeParse(tooOld).success).toBe(false);

    const tooNew = {
      title: "Paper",
      authors: ["Author"],
      year: 2200,
    };
    expect(createPaperSchema.safeParse(tooNew).success).toBe(false);
  });

  it("rejects title exceeding max length", () => {
    const data = {
      title: "x".repeat(501),
      authors: ["Author"],
    };
    expect(createPaperSchema.safeParse(data).success).toBe(false);
  });
});

describe("updatePaperSchema", () => {
  it("accepts partial updates with a single field", () => {
    const data = { title: "Updated Title" };
    const result = updatePaperSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("accepts partial updates with multiple fields", () => {
    const data = { title: "New Title", year: 2025 };
    const result = updatePaperSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects empty update (no fields provided)", () => {
    const data = {};
    const result = updatePaperSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "At least one field must be provided"
      );
    }
  });

  it("still validates field constraints on partial data", () => {
    const data = { title: "" };
    const result = updatePaperSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("searchParamsSchema", () => {
  it("provides defaults when no params given", () => {
    const result = searchParamsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
      expect(result.data.sort).toBe("createdAt");
      expect(result.data.order).toBe("desc");
    }
  });

  it("coerces string numbers to integers", () => {
    const result = searchParamsSchema.safeParse({ page: "3", limit: "20" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects page <= 0", () => {
    const result = searchParamsSchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects limit > 50", () => {
    const result = searchParamsSchema.safeParse({ limit: "51" });
    expect(result.success).toBe(false);
  });

  it("accepts valid sort and order values", () => {
    const result = searchParamsSchema.safeParse({
      sort: "title",
      order: "asc",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid sort value", () => {
    const result = searchParamsSchema.safeParse({ sort: "invalid" });
    expect(result.success).toBe(false);
  });

  it("accepts optional search/filter params", () => {
    const result = searchParamsSchema.safeParse({
      search: "machine learning",
      author: "Alice",
      keyword: "AI",
      yearFrom: "2020",
      yearTo: "2024",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("machine learning");
      expect(result.data.yearFrom).toBe(2020);
      expect(result.data.yearTo).toBe(2024);
    }
  });
});

describe("verifyPasswordSchema", () => {
  it("accepts a non-empty password", () => {
    const result = verifyPasswordSchema.safeParse({ password: "secret123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty password", () => {
    const result = verifyPasswordSchema.safeParse({ password: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing password field", () => {
    const result = verifyPasswordSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
