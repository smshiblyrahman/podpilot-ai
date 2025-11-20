import { ConvexHttpClient } from "convex/browser";

/**
 * Singleton Convex HTTP client instance
 * Used across server actions, API routes, and Inngest functions
 */
export const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "",
);

