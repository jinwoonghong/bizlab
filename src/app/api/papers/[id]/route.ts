import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updatePaperSchema } from "@/lib/validations";
import { parsePaperFromDb, serializePaperForDb } from "@/lib/utils";
import type { ApiError } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

function verifyAdminPassword(request: NextRequest): { valid: boolean; error?: string } {
  const password = request.headers.get("x-admin-password");
  if (!password) {
    return { valid: false, error: "Admin password required" };
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return { valid: false, error: "Invalid admin password" };
  }
  return { valid: true };
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const paper = await prisma.paper.findUnique({ where: { id } });

    if (!paper) {
      return NextResponse.json<ApiError>(
        { error: "Paper not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(parsePaperFromDb(paper));
  } catch (error) {
    console.error("GET /api/papers/[id] error:", error);
    return NextResponse.json<ApiError>(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = verifyAdminPassword(request);
    if (!auth.valid) {
      return NextResponse.json<ApiError>(
        { error: auth.error! },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const body = await request.json();
    const parsed = updatePaperSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiError>(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.paper.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiError>(
        { error: "Paper not found" },
        { status: 404 }
      );
    }

    const dbData = serializePaperForDb(parsed.data as Record<string, unknown>);

    const updated = await prisma.paper.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: dbData as any,
    });

    return NextResponse.json(parsePaperFromDb(updated));
  } catch (error) {
    console.error("PUT /api/papers/[id] error:", error);
    return NextResponse.json<ApiError>(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = verifyAdminPassword(request);
    if (!auth.valid) {
      return NextResponse.json<ApiError>(
        { error: auth.error! },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const existing = await prisma.paper.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiError>(
        { error: "Paper not found" },
        { status: 404 }
      );
    }

    await prisma.paper.delete({ where: { id } });

    return NextResponse.json({ message: "Paper deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/papers/[id] error:", error);
    return NextResponse.json<ApiError>(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
