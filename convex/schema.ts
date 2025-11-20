import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    userId: v.string(),

    inputUrl: v.string(),
    fileName: v.string(),
    fileSize: v.number(),
    fileDuration: v.optional(v.number()),
    fileFormat: v.string(),
    mimeType: v.string(),

    status: v.union(
      v.literal("uploaded"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),

    jobStatus: v.object({
      transcription: v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed")
      ),
      keyMoments: v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed")
      ),
      summary: v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed")
      ),
      captions: v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed")
      ),
      social: v.optional(
        v.union(
          v.literal("pending"),
          v.literal("running"),
          v.literal("completed"),
          v.literal("failed")
        )
      ),
      titles: v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed")
      ),
      hashtags: v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed")
      ),
      youtubeTimestamps: v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed")
      ),
    }),

    metrics: v.optional(
      v.object({
        totalProcessingTime: v.optional(v.number()),
        transcriptionTokens: v.optional(v.number()),
        generationTokens: v.optional(v.number()),
      })
    ),

    error: v.optional(
      v.object({
        message: v.string(),
        step: v.string(),
        timestamp: v.number(),
        details: v.optional(
          v.object({
            statusCode: v.optional(v.number()),
            stack: v.optional(v.string()),
          })
        ),
      })
    ),

    transcript: v.optional(
      v.object({
        text: v.string(),
        segments: v.array(
          v.object({
            id: v.number(),
            start: v.number(),
            end: v.number(),
            text: v.string(),
            words: v.optional(
              v.array(
                v.object({
                  word: v.string(),
                  start: v.number(),
                  end: v.number(),
                })
              )
            ),
          })
        ),
        speakers: v.optional(
          v.array(
            v.object({
              speaker: v.string(),
              start: v.number(),
              end: v.number(),
              text: v.string(),
              confidence: v.number(),
            })
          )
        ),
      })
    ),

    keyMoments: v.optional(
      v.array(
        v.object({
          time: v.string(),
          timestamp: v.number(),
          text: v.string(),
          description: v.string(),
        })
      )
    ),

    summary: v.optional(
      v.object({
        full: v.string(),
        bullets: v.array(v.string()),
        insights: v.array(v.string()),
        tldr: v.string(),
      })
    ),

    captions: v.optional(
      v.object({
        srtUrl: v.string(),
        rawText: v.string(),
      })
    ),

    socialPosts: v.optional(
      v.object({
        twitter: v.string(),
        linkedin: v.string(),
        instagram: v.string(),
        tiktok: v.string(),
        youtube: v.string(),
        facebook: v.string(),
      })
    ),

    titles: v.optional(
      v.object({
        youtubeShort: v.array(v.string()),
        youtubeLong: v.array(v.string()),
        podcastTitles: v.array(v.string()),
        seoKeywords: v.array(v.string()),
      })
    ),

    hashtags: v.optional(
      v.object({
        youtube: v.array(v.string()),
        instagram: v.array(v.string()),
        tiktok: v.array(v.string()),
        linkedin: v.array(v.string()),
        twitter: v.array(v.string()),
      })
    ),

    youtubeTimestamps: v.optional(
      v.array(
        v.object({
          timestamp: v.string(),
          description: v.string(),
        })
      )
    ),

    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_created_at", ["createdAt"]),
});
