import type { Id } from "@/convex/_generated/dataModel";
import type { TranscriptWithExtras } from "../../types/assemblyai";
import type { step as InngestStep } from "inngest";
import type { PublishFunction } from "../../lib/realtime";

type KeyMoment = {
  time: string;
  timestamp: number;
  text: string;
  description: string;
};

export async function generateKeyMoments(
  step: typeof InngestStep,
  transcript: TranscriptWithExtras,
  projectId: Id<"projects">,
  publish: PublishFunction
): Promise<KeyMoment[]> {
  // Publish start as a tracked step
  await step.run("key-moments:publish-start", async () => {
    await publish({
      channel: `project:${projectId}`,
      topic: "ai-generation:keyMoments:start",
      data: {
        job: "keyMoments",
        status: "running",
        message: "Extracting key moments...",
      },
    });
  });

  console.log("Generating key moments from AssemblyAI chapters");

  // Use AssemblyAI's auto-generated chapters
  const chapters = transcript.chapters || [];

  const keyMoments = chapters.map((chapter) => {
    const startSeconds = chapter.start / 1000;
    const hours = Math.floor(startSeconds / 3600);
    const minutes = Math.floor((startSeconds % 3600) / 60);
    const seconds = Math.floor(startSeconds % 60);

    const timeString = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    return {
      time: timeString,
      timestamp: startSeconds,
      text: chapter.headline,
      description: chapter.summary,
    };
  });

  // Publish complete as a tracked step
  await step.run("key-moments:publish-complete", async () => {
    await publish({
      channel: `project:${projectId}`,
      topic: "ai-generation:keyMoments:complete",
      data: {
        job: "keyMoments",
        status: "completed",
        message: "Key moments extracted!",
      },
    });
  });

  return keyMoments;
}
