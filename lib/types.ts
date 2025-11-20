/**
 * Shared type definitions used across the application
 */

/**
 * Phase status for processing workflow
 * Used by realtime updates and UI components
 */
export type PhaseStatus = "pending" | "running" | "completed";

/**
 * Upload status for file uploads
 */
export type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "error";

