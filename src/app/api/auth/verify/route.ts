import { NextRequest, NextResponse } from "next/server";
import { verifyPasswordSchema } from "@/lib/validations";
import type { ApiError, AuthVerifyResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = verifyPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiError>(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        },
        { status: 400 }
      );
    }

    const { password } = parsed.data;
    const verified = password === process.env.ADMIN_PASSWORD;

    return NextResponse.json<AuthVerifyResponse>({ verified });
  } catch (error) {
    console.error("POST /api/auth/verify error:", error);
    return NextResponse.json<ApiError>(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
