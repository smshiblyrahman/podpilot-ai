"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Doc } from "@/convex/_generated/dataModel";

interface ProjectStatusCardProps {
  project: Doc<"projects">;
}

export function ProjectStatusCard({ project }: ProjectStatusCardProps) {
  const getStatusColor = (
    status: "uploaded" | "processing" | "completed" | "failed"
  ) => {
    switch (status) {
      case "uploaded":
        return "default";
      case "processing":
        return "secondary";
      case "completed":
        return "default";
      case "failed":
        return "destructive";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{project.fileName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Created {formatDate(project.createdAt)}
            </p>
          </div>
          <Badge variant={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">File Size</p>
            <p className="font-medium">
              {(project.fileSize / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Format</p>
            <p className="font-medium uppercase">{project.fileFormat}</p>
          </div>
          {project.fileDuration && (
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-medium">
                {Math.floor(project.fileDuration / 60)}:
                {String(Math.floor(project.fileDuration % 60)).padStart(2, "0")}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

