import { api } from "@/convex/_generated/api";
import { inngest } from "@/inngest/client";
import { REALTIME_TOPICS } from "../lib/realtime-topics";
import { generateHashtags } from "../steps/ai-generation/hashtags";
import { generateKeyMoments } from "../steps/ai-generation/key-moments";
import { generateSocialPosts } from "../steps/ai-generation/social-posts";
import { generateSummary } from "../steps/ai-generation/summary";
import { generateTitles } from "../steps/ai-generation/titles";
import { generateYouTubeTimestamps } from "../steps/ai-generation/youtube-timestamps";
import { saveResultsToConvex } from "../steps/persistence/save-to-convex";
import { transcribeWithAssemblyAI } from "../steps/transcription/assemblyai";
import { convex } from "@/lib/convex-client";

export const podcastProcessor = inngest.createFunction(
  {
    id: "podcast-processor",
    optimizeParallelism: true,
  },
  { event: "podcast/uploaded" },
  async ({ event, step, publish }) => {
    const { projectId, fileUrl } = event.data;

    await step.run("update-status-processing", async () => {
      await convex.mutation(api.projects.updateProjectStatus, {
        projectId,
        status: "processing",
      });
    });

    // Tutorial: Publish realtime event to notify UI that transcription is starting
    await publish({
      channel: `project:${projectId}`,
      topic: REALTIME_TOPICS.TRANSCRIPTION_START,
      data: { message: "Starting transcription..." },
    });

    const transcript = await step.run("transcribe-audio", () =>
      transcribeWithAssemblyAI(fileUrl, projectId)
    );

    await publish({
      channel: `project:${projectId}`,
      topic: REALTIME_TOPICS.TRANSCRIPTION_DONE,
      data: { message: "Transcription complete!" },
    });

    // Tutorial: Run 6 AI generation tasks in parallel using Promise.all
    // This significantly reduces total processing time vs sequential execution
    await publish({
      channel: `project:${projectId}`,
      topic: REALTIME_TOPICS.GENERATION_START,
      data: { message: "Generating AI content (6 outputs)..." },
    });

    const [
      keyMoments,
      summary,
      socialPosts,
      titles,
      hashtags,
      youtubeTimestamps,
    ] = await Promise.all([
      generateKeyMoments(transcript),
      generateSummary(step, transcript),
      generateSocialPosts(step, transcript),
      generateTitles(step, transcript),
      generateHashtags(step, transcript),
      generateYouTubeTimestamps(step, transcript),
    ]);

    await publish({
      channel: `project:${projectId}`,
      topic: REALTIME_TOPICS.GENERATION_DONE,
      data: { message: "All AI content generated!" },
    });

    await step.run("save-results-to-convex", () =>
      saveResultsToConvex(projectId, {
        keyMoments,
        summary,
        socialPosts,
        titles,
        hashtags,
        youtubeTimestamps,
      })
    );

    return { success: true, projectId };
  }
);
