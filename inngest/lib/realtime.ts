// Inngest Realtime publishing helpers to reduce duplication

// Export PublishFunction type for use in AI generation functions
export type PublishFunction = (args: {
  channel: string;
  topic: string;
  data: Record<string, unknown>;
}) => Promise<Record<string, unknown>>;

export async function publishStepStart(
  publish: PublishFunction | undefined,
  projectId: string,
  step: string,
  message: string,
  progress: number
) {
  // Skip if publish is not available (e.g., during parallel execution)
  if (!publish) return;

  // Use unique step name in the publish call to avoid duplicate step IDs in parallel execution
  await publish({
    channel: `project:${projectId}`,
    topic: `processing:${step}:start`,
    data: { step, status: "running", message, progress },
  });
}

export async function publishStepComplete(
  publish: PublishFunction | undefined,
  projectId: string,
  step: string,
  message: string,
  progress: number
) {
  // Skip if publish is not available (e.g., during parallel execution)
  if (!publish) return;

  // Use unique step name in the publish call to avoid duplicate step IDs in parallel execution
  await publish({
    channel: `project:${projectId}`,
    topic: `processing:${step}:complete`,
    data: { step, status: "completed", message, progress },
  });
}

export async function publishResult(
  publish: PublishFunction | undefined,
  projectId: string,
  type: string,
  content: unknown
) {
  // Skip if publish is not available (e.g., during parallel execution)
  if (!publish) return;

  // Use unique type in the publish call to avoid duplicate step IDs in parallel execution
  await publish({
    channel: `project:${projectId}`,
    topic: `results:${type}`,
    data: { type, content },
  });
}
