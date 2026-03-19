import { describe, it, expect } from "vitest";
import { createRequest, parseResponse } from "@/__tests__/helpers";
import { POST } from "./route";
import type { ApiError, AuthVerifyResponse } from "@/types";

describe("POST /api/auth/verify", () => {
  // REQ-E06: Correct admin password allows edit/delete
  it("returns verified: true for correct password", async () => {
    const request = createRequest("http://localhost:3000/api/auth/verify", {
      method: "POST",
      body: { password: "test-admin-password" },
    });
    const response = await POST(request);
    const body = await parseResponse<AuthVerifyResponse>(response);

    expect(response.status).toBe(200);
    expect(body.verified).toBe(true);
  });

  // REQ-N01: Incorrect admin password is denied
  it("returns verified: false for incorrect password", async () => {
    const request = createRequest("http://localhost:3000/api/auth/verify", {
      method: "POST",
      body: { password: "wrong-password" },
    });
    const response = await POST(request);
    const body = await parseResponse<AuthVerifyResponse>(response);

    expect(response.status).toBe(200);
    expect(body.verified).toBe(false);
  });

  it("returns 400 when password is missing", async () => {
    const request = createRequest("http://localhost:3000/api/auth/verify", {
      method: "POST",
      body: {},
    });
    const response = await POST(request);
    const body = await parseResponse<ApiError>(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe("Validation failed");
  });

  it("returns 400 when password is empty string", async () => {
    const request = createRequest("http://localhost:3000/api/auth/verify", {
      method: "POST",
      body: { password: "" },
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  // REQ-N04: Admin password not exposed in responses
  it("does not expose the admin password in the response", async () => {
    const request = createRequest("http://localhost:3000/api/auth/verify", {
      method: "POST",
      body: { password: "test-admin-password" },
    });
    const response = await POST(request);
    const text = await response.clone().text();

    // The response body should not contain the actual admin password value
    expect(text).not.toContain("test-admin-password");
    // Should only contain the verified boolean
    const body = JSON.parse(text);
    expect(Object.keys(body)).toEqual(["verified"]);
  });
});
