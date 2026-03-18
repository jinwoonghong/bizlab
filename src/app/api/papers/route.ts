import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaperSchema, searchParamsSchema } from "@/lib/validations";
import { parsePaperFromDb, serializePaperForDb } from "@/lib/utils";
import type { PaperListResponse, ApiError } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      rawParams[key] = value;
    });

    const parsed = searchParamsSchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json<ApiError>(
        {
          error: "Invalid query parameters",
          details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        },
        { status: 400 }
      );
    }

    const { page, limit, search, author, keyword, yearFrom, yearTo, sort, order } =
      parsed.data;

    const where: Record<string, unknown>[] = [];

    if (search) {
      where.push({
        OR: [
          { title: { contains: search } },
          { abstract: { contains: search } },
        ],
      });
    }

    if (author) {
      where.push({ authors: { contains: author } });
    }

    if (keyword) {
      where.push({ keywords: { contains: keyword } });
    }

    if (yearFrom !== undefined) {
      where.push({ year: { gte: yearFrom } });
    }

    if (yearTo !== undefined) {
      where.push({ year: { lte: yearTo } });
    }

    const whereClause = where.length > 0 ? { AND: where } : {};

    const [papers, total] = await Promise.all([
      prisma.paper.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort]: order },
      }),
      prisma.paper.count({ where: whereClause }),
    ]);

    const response: PaperListResponse = {
      papers: papers.map(parsePaperFromDb),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/papers error:", error);
    return NextResponse.json<ApiError>(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = createPaperSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiError>(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        },
        { status: 400 }
      );
    }

    const dbData = serializePaperForDb(parsed.data as Record<string, unknown>);

    const paper = await prisma.paper.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: dbData as any,
    });

    return NextResponse.json(parsePaperFromDb(paper), { status: 201 });
  } catch (error) {
    console.error("POST /api/papers error:", error);
    return NextResponse.json<ApiError>(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
