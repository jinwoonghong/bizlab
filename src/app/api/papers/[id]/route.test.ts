import { describe, it, expect, beforeEach } from "vitest";
import { prismaMock } from "@/__tests__/mocks/prisma";
import {
  createRequest,
  parseResponse,
  createMockDbPaper,
} from "@/__tests__/helpers";
import { GET, PUT, DELETE } from "./route";
import type { ApiError } from "@/types";

// Helper to create route context with params Promise (Next.js 15 pattern)
function createRouteContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("GET /api/papers/[id]", () => {
  beforeEach(() => {
    prismaMock.paper.findUnique.mockReset();
  });

  it("returns a paper by id", async () => {
    const mockPaper = createMockDbPaper({ id: "abc123" });
    prismaMock.paper.findUnique.mockResolvedValue(mockPaper);

    const request = createRequest("http://localhost:3000/api/papers/abc123");
    const response = await GET(request, createRouteContext("abc123"));
    const body = await parseResponse<Record<string, unknown>>(response);

    expect(response.status).toBe(200);
    expect(body.id).toBe("abc123");
    expect(Array.isArray(body.authors)).toBe(true);
    expect(prismaMock.paper.findUnique).toHaveBeenCalledWith({
      where: { id: "abc123" },
    });
  });

  // REQ-N03: Non-existent paper ID returns 404
  it("returns 404 for non-existent paper", async () => {
    prismaMock.paper.findUnique.mockResolvedValue(null);

    const request = createRequest(
      "http://localhost:3000/api/papers/nonexistent"
    );
    const response = await GET(request, createRouteContext("nonexistent"));
    const body = await parseResponse<ApiError>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe("Paper not found");
  });

  it("returns 500 on database error", async () => {
    prismaMock.paper.findUnique.mockRejectedValue(new Error("DB error"));

    const request = createRequest("http://localhost:3000/api/papers/abc123");
    const response = await GET(request, createRouteContext("abc123"));

    expect(response.status).toBe(500);
  });
});

describe("PUT /api/papers/[id]", () => {
  beforeEach(() => {
    prismaMock.paper.findUnique.mockReset();
    prismaMock.paper.update.mockReset();
  });

  it("updates a paper with valid data and admin password", async () => {
    const mockExisting = createMockDbPaper({ id: "abc123" });
    prismaMock.paper.findUnique.mockResolvedValue(mockExisting);

    const updatedPaper = createMockDbPaper({
      id: "abc123",
      title: "Updated Title",
    });
    prismaMock.paper.update.mockResolvedValue(updatedPaper);

    const request = createRequest("http://localhost:3000/api/papers/abc123", {
      method: "PUT",
      body: { title: "Updated Title" },
      headers: { "x-admin-password": "test-admin-password" },
    });
    const response = await PUT(request, createRouteContext("abc123"));
    const body = await parseResponse<Record<string, unknown>>(response);

    expect(response.status).toBe(200);
    expect(body.title).toBe("Updated Title");
  });

  // REQ-E06: Correct admin password allows edit/delete
  it("requires admin password header", async () => {
    const request = createRequest("http://localhost:3000/api/papers/abc123", {
      method: "PUT",
      body: { title: "Updated Title" },
      // No x-admin-password header
    });
    const response = await PUT(request, createRouteContext("abc123"));
    const body = await parseResponse<ApiError>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe("Admin password required");
  });

  // REQ-N01: Incorrect admin password is denied
  it("rejects incorrect admin password", async () => {
    const request = createRequest("http://localhost:3000/api/papers/abc123", {
      method: "PUT",
      body: { title: "Updated Title" },
      headers: { "x-admin-password": "wrong-password" },
    });
    const response = await PUT(request, createRouteContext("abc123"));
    const body = await parseResponse<ApiError>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe("Invalid admin password");
  });

  it("returns 400 for invalid update data (empty body)", async () => {
    const request = createRequest("http://localhost:3000/api/papers/abc123", {
      method: "PUT",
      body: {},
      headers: { "x-admin-password": "test-admin-password" },
    });
    const response = await PUT(request, createRouteContext("abc123"));

    expect(response.status).toBe(400);
  });

  // REQ-N03: Non-existent paper ID returns 404
  it("returns 404 when paper does not exist", async () => {
    prismaMock.paper.findUnique.mockResolvedValue(null);

    const request = createRequest(
      "http://localhost:3000/api/papers/nonexistent",
      {
        method: "PUT",
        body: { title: "Updated" },
        headers: { "x-admin-password": "test-admin-password" },
      }
    );
    const response = await PUT(request, createRouteContext("nonexistent"));
    const body = await parseResponse<ApiError>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe("Paper not found");
  });

  it("returns 500 on database error during update", async () => {
    prismaMock.paper.findUnique.mockResolvedValue(
      createMockDbPaper({ id: "abc123" })
    );
    prismaMock.paper.update.mockRejectedValue(new Error("DB error"));

    const request = createRequest("http://localhost:3000/api/papers/abc123", {
      method: "PUT",
      body: { title: "Updated" },
      headers: { "x-admin-password": "test-admin-password" },
    });
    const response = await PUT(request, createRouteContext("abc123"));

    expect(response.status).toBe(500);
  });
});

describe("DELETE /api/papers/[id]", () => {
  beforeEach(() => {
    prismaMock.paper.findUnique.mockReset();
    prismaMock.paper.delete.mockReset();
  });

  // REQ-E06: Correct admin password allows edit/delete
  it("deletes a paper with valid admin password", async () => {
    prismaMock.paper.findUnique.mockResolvedValue(
      createMockDbPaper({ id: "abc123" })
    );
    prismaMock.paper.delete.mockResolvedValue(
      createMockDbPaper({ id: "abc123" })
    );

    const request = createRequest("http://localhost:3000/api/papers/abc123", {
      method: "DELETE",
      headers: { "x-admin-password": "test-admin-password" },
    });
    const response = await DELETE(request, createRouteContext("abc123"));
    const body = await parseResponse<{ message: string }>(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe("Paper deleted successfully");
    expect(prismaMock.paper.delete).toHaveBeenCalledWith({
      where: { id: "abc123" },
    });
  });

  it("requires admin password for deletion", async () => {
    const request = createRequest("http://localhost:3000/api/papers/abc123", {
      method: "DELETE",
    });
    const response = await DELETE(request, createRouteContext("abc123"));

    expect(response.status).toBe(401);
  });

  // REQ-N01: Incorrect admin password is denied
  it("rejects incorrect admin password for deletion", async () => {
    const request = createRequest("http://localhost:3000/api/papers/abc123", {
      method: "DELETE",
      headers: { "x-admin-password": "wrong" },
    });
    const response = await DELETE(request, createRouteContext("abc123"));
    const body = await parseResponse<ApiError>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe("Invalid admin password");
  });

  // REQ-N03: Non-existent paper ID returns 404
  it("returns 404 when trying to delete non-existent paper", async () => {
    prismaMock.paper.findUnique.mockResolvedValue(null);

    const request = createRequest(
      "http://localhost:3000/api/papers/nonexistent",
      {
        method: "DELETE",
        headers: { "x-admin-password": "test-admin-password" },
      }
    );
    const response = await DELETE(request, createRouteContext("nonexistent"));
    const body = await parseResponse<ApiError>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe("Paper not found");
  });
});
