import { z } from "zod";

export const uploadJobSchema = z.object({
  id: z.string(),
  githubToken: z.string().min(1),
  repositoryUrl: z.string().url(),
  targetBranch: z.string().default("main"),
  commitMessage: z.string().optional(),
  preserveStructure: z.boolean().default(true),
  overwriteFiles: z.boolean().default(false),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  progress: z.number().min(0).max(100).default(0),
  currentFile: z.string().optional(),
  filesProcessed: z.number().default(0),
  totalFiles: z.number().default(0),
  logs: z.array(z.object({
    timestamp: z.string(),
    level: z.enum(["info", "warn", "error"]),
    message: z.string()
  })).default([]),
  error: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const insertUploadJobSchema = uploadJobSchema.omit({
  id: true,
  status: true,
  progress: true,
  currentFile: true,
  filesProcessed: true,
  totalFiles: true,
  logs: true,
  error: true,
  createdAt: true,
  updatedAt: true
});

export type UploadJob = z.infer<typeof uploadJobSchema>;
export type InsertUploadJob = z.infer<typeof insertUploadJobSchema>;

export const fileInfoSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string()
});

export type FileInfo = z.infer<typeof fileInfoSchema>;

export const githubValidationSchema = z.object({
  token: z.string().min(1),
  repositoryUrl: z.string().url()
});

export type GitHubValidation = z.infer<typeof githubValidationSchema>;
