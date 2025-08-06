import { type UploadJob, type InsertUploadJob } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUploadJob(id: string): Promise<UploadJob | undefined>;
  createUploadJob(job: InsertUploadJob): Promise<UploadJob>;
  updateUploadJob(id: string, updates: Partial<UploadJob>): Promise<UploadJob | undefined>;
  getAllUploadJobs(): Promise<UploadJob[]>;
}

export class MemStorage implements IStorage {
  private uploadJobs: Map<string, UploadJob>;

  constructor() {
    this.uploadJobs = new Map();
  }

  async getUploadJob(id: string): Promise<UploadJob | undefined> {
    return this.uploadJobs.get(id);
  }

  async createUploadJob(insertJob: InsertUploadJob): Promise<UploadJob> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const job: UploadJob = {
      ...insertJob,
      id,
      status: "pending",
      progress: 0,
      filesProcessed: 0,
      totalFiles: 0,
      logs: [{
        timestamp: now,
        level: "info",
        message: "Job créé avec succès"
      }],
      createdAt: now,
      updatedAt: now
    };
    this.uploadJobs.set(id, job);
    return job;
  }

  async updateUploadJob(id: string, updates: Partial<UploadJob>): Promise<UploadJob | undefined> {
    const job = this.uploadJobs.get(id);
    if (!job) return undefined;

    const updatedJob: UploadJob = {
      ...job,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.uploadJobs.set(id, updatedJob);
    return updatedJob;
  }

  async getAllUploadJobs(): Promise<UploadJob[]> {
    return Array.from(this.uploadJobs.values());
  }
}

export const storage = new MemStorage();
