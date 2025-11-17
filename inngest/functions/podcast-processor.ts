import { inngest } from "@/inngest/client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { put } from "@vercel/blob";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

export const podcastProcessor = inngest.createFunction(
  { id: "podcast-processor" },
  { event: "podcast/uploaded" },
  async ({ event, step }) => {
    const { projectId, fileUrl, mimeType } = event.data;

    // Update project status to processing
    await step.run("update-status-processing", async () => {
      await convex.mutation(api.projects.updateProjectStatus, {
        projectId,
        status: "processing",
      });
    });

    // =======================================================================
    // LINEAR PHASE: Audio Extraction & Transcription
    // =======================================================================

    // Step 1: Extract audio from video (if needed)
    const audioUrl = await step.run("extract-audio-if-video", async () => {
      const isVideo = mimeType.startsWith("video/");

      if (!isVideo) {
        // Skip audio extraction for audio files
        await convex.mutation(api.projects.updateJobStatus, {
          projectId,
          job: "audioExtraction",
          status: "skipped",
        });
        return fileUrl;
      }

      // Update job status
      await convex.mutation(api.projects.updateJobStatus, {
        projectId,
        job: "audioExtraction",
        status: "running",
      });

      // TODO: Implement actual audio extraction using FFmpeg or similar
      console.log("Extracting audio from video:", fileUrl);

      // Mock: Simulate audio extraction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In production, you would:
      // 1. Download the video file using authenticated request
      // 2. Extract audio using FFmpeg
      // 3. Upload extracted audio to Vercel Blob (private)
      // 4. Return the audio URL

      const mockAudioUrl = fileUrl; // Use original for now

      await convex.mutation(api.projects.saveAudioUrl, {
        projectId,
        audioUrl: mockAudioUrl,
      });

      await convex.mutation(api.projects.updateJobStatus, {
        projectId,
        job: "audioExtraction",
        status: "completed",
      });

      return mockAudioUrl;
    });

    // Step 2: Transcribe audio
    const transcript = await step.run("transcribe-audio", async () => {
      await convex.mutation(api.projects.updateJobStatus, {
        projectId,
        job: "transcription",
        status: "running",
      });

      // TODO: Implement actual transcription using OpenAI Whisper
      console.log("Transcribing audio:", audioUrl);

      // Mock: Simulate transcription
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // In production, you would:
      // 1. Download the audio file using authenticated request
      // 2. Send to OpenAI Whisper API
      // 3. Get back transcript with segments and timestamps

      const mockTranscript = {
        text: "This is a mock transcript of the podcast. In this episode, we discuss important topics about technology and innovation. We explore various aspects of AI and machine learning.",
        segments: [
          {
            id: 0,
            start: 0,
            end: 5.5,
            text: "This is a mock transcript of the podcast.",
            words: [
              { word: "This", start: 0, end: 0.5 },
              { word: "is", start: 0.5, end: 0.7 },
              { word: "a", start: 0.7, end: 0.8 },
              { word: "mock", start: 0.8, end: 1.2 },
              { word: "transcript", start: 1.2, end: 1.8 },
            ],
          },
          {
            id: 1,
            start: 5.5,
            end: 12.0,
            text: "In this episode, we discuss important topics about technology and innovation.",
            words: [],
          },
          {
            id: 2,
            start: 12.0,
            end: 18.0,
            text: "We explore various aspects of AI and machine learning.",
            words: [],
          },
        ],
      };

      await convex.mutation(api.projects.saveTranscript, {
        projectId,
        transcript: mockTranscript,
      });

      await convex.mutation(api.projects.updateJobStatus, {
        projectId,
        job: "transcription",
        status: "completed",
      });

      return mockTranscript;
    });

    // =======================================================================
    // PARALLEL PHASE: Content Generation
    // =======================================================================

    const [keyMoments, summary, captions, titles, hashtags] = await Promise.all(
      [
        // Generate key moments
        step.run("generate-key-moments", async () => {
          await convex.mutation(api.projects.updateJobStatus, {
            projectId,
            job: "keyMoments",
            status: "running",
          });

          // TODO: Use GPT to analyze transcript and identify key moments
          console.log("Generating key moments from transcript");

          await new Promise((resolve) => setTimeout(resolve, 2000));

          const mockKeyMoments = [
            {
              time: "00:01:30",
              timestamp: 90,
              text: "Introduction to the topic",
              description:
                "Host introduces the main theme of today's discussion",
            },
            {
              time: "00:05:45",
              timestamp: 345,
              text: "Key insight about AI",
              description:
                "Important point about artificial intelligence trends",
            },
            {
              time: "00:12:20",
              timestamp: 740,
              text: "Guest shares expertise",
              description: "Guest provides valuable industry insights",
            },
          ];

          await convex.mutation(api.projects.updateJobStatus, {
            projectId,
            job: "keyMoments",
            status: "completed",
          });

          return mockKeyMoments;
        }),

        // Generate summary
        step.run("generate-podcast-summary", async () => {
          await convex.mutation(api.projects.updateJobStatus, {
            projectId,
            job: "summary",
            status: "running",
          });

          // TODO: Use GPT to generate comprehensive summary
          console.log("Generating podcast summary");

          await new Promise((resolve) => setTimeout(resolve, 2000));

          const mockSummary = {
            full: "This podcast episode explores the fascinating world of artificial intelligence and its impact on modern technology. The host and guests discuss various applications of AI, machine learning trends, and the future of technology innovation.",
            bullets: [
              "Introduction to AI and machine learning fundamentals",
              "Discussion of real-world AI applications",
              "Future trends in technology and innovation",
              "Expert insights from industry leaders",
            ],
            insights: [
              "AI is transforming industries at an unprecedented pace",
              "Machine learning requires careful ethical considerations",
              "The future of work will be heavily influenced by AI",
            ],
            tldr: "An insightful discussion about AI, machine learning, and the future of technology innovation.",
          };

          await convex.mutation(api.projects.updateJobStatus, {
            projectId,
            job: "summary",
            status: "completed",
          });

          return mockSummary;
        }),

        // Generate captions
        step.run("generate-captions", async () => {
          await convex.mutation(api.projects.updateJobStatus, {
            projectId,
            job: "captions",
            status: "running",
          });

          // TODO: Convert transcript to SRT format
          console.log("Generating SRT captions");

          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Generate SRT content
          const srtContent = `1
00:00:00,000 --> 00:00:05,500
This is a mock transcript of the podcast.

2
00:00:05,500 --> 00:00:12,000
In this episode, we discuss important topics about technology and innovation.

3
00:00:12,000 --> 00:00:18,000
We explore various aspects of AI and machine learning.
`;

          // Upload SRT to Vercel Blob
          const srtBlob = await put(
            `captions/${projectId}/captions.srt`,
            srtContent,
            {
              access: "public",
              contentType: "text/plain",
              token: process.env.BLOB_READ_WRITE_TOKEN,
            }
          );

          const mockCaptions = {
            srtUrl: srtBlob.url,
            rawText: transcript.text,
          };

          await convex.mutation(api.projects.updateJobStatus, {
            projectId,
            job: "captions",
            status: "completed",
          });

          return mockCaptions;
        }),

        // Generate titles
        step.run("generate-titles", async () => {
          await convex.mutation(api.projects.updateJobStatus, {
            projectId,
            job: "titles",
            status: "running",
          });

          // TODO: Use GPT to generate compelling titles
          console.log("Generating title suggestions");

          await new Promise((resolve) => setTimeout(resolve, 1500));

          const mockTitles = {
            youtubeShort: [
              "AI Revolution: What You Need to Know",
              "The Future of Technology Explained",
              "Machine Learning Secrets Revealed",
            ],
            youtubeLong: [
              "The Complete Guide to AI and Machine Learning in 2024 | Expert Insights",
              "How Artificial Intelligence is Transforming Technology | In-Depth Discussion",
              "Understanding AI: A Comprehensive Overview for Beginners and Experts",
            ],
            podcastTitles: [
              "Episode 42: The AI Revolution",
              "Tech Talk: Exploring Machine Learning",
              "Innovation Unplugged: AI Edition",
            ],
            seoKeywords: [
              "artificial intelligence",
              "machine learning",
              "technology trends",
              "AI innovation",
              "future of tech",
            ],
          };

          await convex.mutation(api.projects.updateJobStatus, {
            projectId,
            job: "titles",
            status: "completed",
          });

          return mockTitles;
        }),

        // Generate hashtags
        step.run("generate-hashtags", async () => {
          await convex.mutation(api.projects.updateJobStatus, {
            projectId,
            job: "hashtags",
            status: "running",
          });

          // TODO: Use GPT to generate platform-specific hashtags
          console.log("Generating hashtags");

          await new Promise((resolve) => setTimeout(resolve, 1500));

          const mockHashtags = {
            youtube: [
              "#AI",
              "#MachineLearning",
              "#Technology",
              "#Innovation",
              "#TechTalk",
            ],
            instagram: [
              "#ArtificialIntelligence",
              "#AITechnology",
              "#TechPodcast",
              "#Innovation",
              "#FutureTech",
              "#MLCommunity",
            ],
            tiktok: [
              "#AI",
              "#Tech",
              "#Learning",
              "#Innovation",
              "#TechTok",
              "#AIExplained",
            ],
            linkedin: [
              "#ArtificialIntelligence",
              "#MachineLearning",
              "#TechnologyTrends",
              "#Innovation",
              "#DigitalTransformation",
            ],
            twitter: [
              "#AI",
              "#MachineLearning",
              "#TechNews",
              "#Innovation",
              "#AIResearch",
            ],
          };

          await convex.mutation(api.projects.updateJobStatus, {
            projectId,
            job: "hashtags",
            status: "completed",
          });

          return mockHashtags;
        }),
      ]
    );

    // =======================================================================
    // JOIN PHASE: Save all results to Convex
    // =======================================================================

    await step.run("save-results-to-convex", async () => {
      await convex.mutation(api.projects.saveGeneratedContent, {
        projectId,
        keyMoments,
        summary,
        captions,
        titles,
        hashtags,
      });

      // Update project status to completed
      await convex.mutation(api.projects.updateProjectStatus, {
        projectId,
        status: "completed",
      });

      console.log("Podcast processing completed for project:", projectId);
    });

    return { success: true, projectId };
  }
);
