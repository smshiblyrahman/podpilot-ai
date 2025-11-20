import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Standardized API response helper
 */
export function apiResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Standardized API error response helper
 */
export function apiError(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Authentication wrapper for API routes
 * Returns userId if authenticated, throws error response if not
 */
export async function withAuth(): Promise<{ userId: string }> {
  const { userId } = await auth();
  if (!userId) {
    throw apiError("Unauthorized", 401);
  }
  return { userId };
}
