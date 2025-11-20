import { formatTimestamp } from "@/lib/format";
import type { TranscriptWithExtras } from "../../types/assemblyai";

type KeyMoment = {
  time: string;
  timestamp: number;
  text: string;
  description: string;
};

export async function generateKeyMoments(
  transcript: TranscriptWithExtras,
): Promise<KeyMoment[]> {
  console.log("Generating key moments from AssemblyAI chapters");

  // Use AssemblyAI's auto-generated chapters
  const chapters = transcript.chapters || [];

  const keyMoments = chapters.map((chapter) => {
    const startSeconds = chapter.start / 1000;

    return {
      time: formatTimestamp(startSeconds, { padHours: true, forceHours: true }),
      timestamp: startSeconds,
      text: chapter.headline,
      description: chapter.summary,
    };
  });

  return keyMoments;
}
