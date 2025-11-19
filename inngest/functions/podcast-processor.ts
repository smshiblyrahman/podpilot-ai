import { inngest } from "@/inngest/client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { transcribeWithAssemblyAI } from "../steps/transcription/assemblyai";
import { generateKeyMoments } from "../steps/ai-generation/key-moments";
import { generateSummary } from "../steps/ai-generation/summary";
import { generateSocialPosts } from "../steps/ai-generation/social-posts";
import { generateTitles } from "../steps/ai-generation/titles";
import { generateHashtags } from "../steps/ai-generation/hashtags";
import { generateYouTubeTimestamps } from "../steps/ai-generation/youtube-timestamps";
import { saveResultsToConvex } from "../steps/persistence/save-to-convex";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

export const podcastProcessor = inngest.createFunction(
  {
    id: "podcast-processor",
    optimizeParallelism: true, // Optimize parallel AI generation steps
  },
  { event: "podcast/uploaded" },
  async ({ event, step, publish }) => {
    const { projectId, fileUrl } = event.data;

    // =======================================================================
    // INITIALIZATION
    // =======================================================================

    await step.run("update-status-processing", async () => {
      await convex.mutation(api.projects.updateProjectStatus, {
        projectId,
        status: "processing",
      });

      await publish({
        channel: `project:${projectId}`,
        topic: "processing:start",
        data: {
          message: "Starting podcast processing...",
          progress: 0,
        },
      });
    });

    // =======================================================================
    // LINEAR PHASE: Transcription
    // =======================================================================

    const transcript = await step.run("transcribe-audio", () =>
      transcribeWithAssemblyAI(fileUrl, projectId, publish)
    );

    // =======================================================================
    // PARALLEL PHASE: AI Content Generation
    // =======================================================================
    // Each function uses step.ai.wrap() internally and publishes realtime updates
    // We call them directly (not wrapped in step.run) to avoid nesting

    const [
      keyMoments,
      summary,
      socialPosts,
      titles,
      hashtags,
      youtubeTimestamps,
    ] = await Promise.all([
      generateKeyMoments(step, transcript, projectId, publish),
      generateSummary(step, transcript, projectId, publish),
      generateSocialPosts(step, transcript, projectId, publish),
      generateTitles(step, transcript, projectId, publish),
      generateHashtags(step, transcript, projectId, publish),
      generateYouTubeTimestamps(step, transcript, projectId, publish),
    ]);

    // =======================================================================
    // JOIN PHASE: Save Results
    // =======================================================================

    await step.run("save-results-to-convex", () =>
      saveResultsToConvex(
        projectId,
        {
          keyMoments,
          summary,
          socialPosts,
          titles,
          hashtags,
          youtubeTimestamps,
        },
        publish
      )
    );

    return { success: true, projectId };
  }
);
