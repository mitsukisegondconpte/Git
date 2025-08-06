import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { Octokit } from "@octokit/rest";
import JSZip from "jszip";
import { storage } from "./storage";
import { insertUploadJobSchema, githubValidationSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers ZIP sont acceptés'));
    }
  }
});

async function validateGitHubAccess(token: string, repoUrl: string) {
  try {
    const octokit = new Octokit({ auth: token });
    
    // Extract owner and repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error("URL de dépôt GitHub invalide");
    
    const [, owner, repo] = match;
    
    // Test repository access
    await octokit.rest.repos.get({ owner, repo: repo.replace('.git', '') });
    
    return { owner, repo: repo.replace('.git', '') };
  } catch (error: any) {
    if (error.status === 401) {
      throw new Error("Token GitHub invalide ou expiré");
    } else if (error.status === 404) {
      throw new Error("Dépôt non trouvé ou pas d'accès");
    } else {
      throw new Error(`Erreur GitHub: ${error.message}`);
    }
  }
}

async function uploadFileToGitHub(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string,
  overwrite: boolean = false
) {
  try {
    // Check if file exists
    let sha: string | undefined;
    if (overwrite) {
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ref: branch
        });
        if ('sha' in data) {
          sha = data.sha;
        }
      } catch (error: any) {
        if (error.status !== 404) throw error;
      }
    }

    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content,
      branch,
      ...(sha && { sha })
    });
  } catch (error: any) {
    throw new Error(`Erreur lors de l'upload de ${path}: ${error.message}`);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Validate GitHub token and repository
  app.post("/api/github/validate", async (req, res) => {
    try {
      const validationData = githubValidationSchema.parse(req.body);
      const { owner, repo } = await validateGitHubAccess(
        validationData.token,
        validationData.repositoryUrl
      );
      
      res.json({ 
        success: true, 
        message: "Connexion GitHub validée avec succès",
        repository: { owner, repo }
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: fromZodError(error).toString() 
        });
      }
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  });

  // Create project ZIP file
  app.post("/api/project-zip/create", async (req, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const zip = new JSZip();
      
      // Function to add directory recursively
      async function addDirectoryToZip(dirPath: string, zipFolder: JSZip) {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const stats = fs.statSync(itemPath);
          
          // Skip node_modules, .git, and other build directories
          if (item === 'node_modules' || item === '.git' || item === 'dist' || item === '.replit') {
            continue;
          }
          
          if (stats.isDirectory()) {
            const folder = zipFolder.folder(item);
            if (folder) {
              await addDirectoryToZip(itemPath, folder);
            }
          } else {
            const content = fs.readFileSync(itemPath);
            zipFolder.file(item, content);
          }
        }
      }
      
      // Add project files to ZIP
      await addDirectoryToZip('.', zip);
      
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="github-uploader-project.zip"'
      });
      
      res.send(zipBuffer);
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: `Erreur lors de la création du ZIP du projet: ${error.message}` 
      });
    }
  });

  // Create test ZIP file
  app.post("/api/test-zip/create", async (req, res) => {
    try {
      const zip = new JSZip();
      
      // Create sample files structure
      zip.file("README.md", "# Projet de Test\n\nCeci est un fichier ZIP de test généré automatiquement.");
      zip.file("package.json", JSON.stringify({
        name: "test-project",
        version: "1.0.0",
        description: "Projet de test pour l'upload GitHub"
      }, null, 2));
      
      const srcFolder = zip.folder("src");
      srcFolder?.file("index.js", "console.log('Hello, GitHub!');");
      srcFolder?.file("utils.js", "export function formatDate(date) {\n  return date.toISOString();\n}");
      
      const componentsFolder = srcFolder?.folder("components");
      componentsFolder?.file("Button.jsx", "import React from 'react';\n\nexport default function Button({ children, onClick }) {\n  return <button onClick={onClick}>{children}</button>;\n}");
      
      const docsFolder = zip.folder("docs");
      docsFolder?.file("installation.md", "# Installation\n\n1. Cloner le dépôt\n2. Installer les dépendances\n3. Démarrer l'application");
      
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="test-project.zip"'
      });
      
      res.send(zipBuffer);
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: `Erreur lors de la création du ZIP de test: ${error.message}` 
      });
    }
  });

  // Upload ZIP file
  app.post("/api/upload", upload.single('zipFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: "Aucun fichier ZIP fourni" 
        });
      }

      const jobData = insertUploadJobSchema.parse(JSON.parse(req.body.jobData));
      const job = await storage.createUploadJob(jobData);

      // Start processing in background
      processZipUpload(job.id, req.file.buffer, jobData);

      res.json({ 
        success: true, 
        jobId: job.id,
        message: "Upload démarré avec succès" 
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: fromZodError(error).toString() 
        });
      }
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  });

  // Get upload job status
  app.get("/api/upload/:jobId", async (req, res) => {
    try {
      const job = await storage.getUploadJob(req.params.jobId);
      if (!job) {
        return res.status(404).json({ 
          success: false, 
          message: "Job non trouvé" 
        });
      }
      res.json({ success: true, job });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  });

  async function processZipUpload(jobId: string, zipBuffer: Buffer, jobData: any) {
    try {
      await storage.updateUploadJob(jobId, {
        status: "processing",
        logs: [{
          timestamp: new Date().toISOString(),
          level: "info",
          message: "Début de l'extraction du fichier ZIP"
        }]
      });

      // Extract ZIP
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(zipBuffer);
      
      const files = Object.keys(zipContent.files).filter(fileName => 
        !zipContent.files[fileName].dir
      );

      await storage.updateUploadJob(jobId, {
        totalFiles: files.length,
        logs: [{
          timestamp: new Date().toISOString(),
          level: "info",
          message: `${files.length} fichiers détectés dans le ZIP`
        }]
      });

      // Validate GitHub access
      const { owner, repo } = await validateGitHubAccess(
        jobData.githubToken,
        jobData.repositoryUrl
      );

      const octokit = new Octokit({ auth: jobData.githubToken });

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const fileName = files[i];
        const file = zipContent.files[fileName];
        
        await storage.updateUploadJob(jobId, {
          currentFile: fileName,
          filesProcessed: i,
          progress: Math.round((i / files.length) * 100)
        });

        try {
          const content = await file.async("base64");
          const path = jobData.preserveStructure ? fileName : fileName.split('/').pop();
          
          await uploadFileToGitHub(
            octokit,
            owner,
            repo,
            path!,
            content,
            jobData.commitMessage || `Upload de ${fileName}`,
            jobData.targetBranch,
            jobData.overwriteFiles
          );

          const currentJob = await storage.getUploadJob(jobId);
          if (currentJob) {
            await storage.updateUploadJob(jobId, {
              logs: [...currentJob.logs, {
                timestamp: new Date().toISOString(),
                level: "info",
                message: `Fichier uploadé: ${fileName}`
              }]
            });
          }
        } catch (error: any) {
          const currentJob = await storage.getUploadJob(jobId);
          if (currentJob) {
            await storage.updateUploadJob(jobId, {
              logs: [...currentJob.logs, {
                timestamp: new Date().toISOString(),
                level: "error",
                message: `Erreur pour ${fileName}: ${error.message}`
              }]
            });
          }
        }
      }

      await storage.updateUploadJob(jobId, {
        status: "completed",
        progress: 100,
        filesProcessed: files.length,
        logs: [{
          timestamp: new Date().toISOString(),
          level: "info",
          message: "Upload terminé avec succès"
        }]
      });

    } catch (error: any) {
      await storage.updateUploadJob(jobId, {
        status: "failed",
        error: error.message,
        logs: [{
          timestamp: new Date().toISOString(),
          level: "error",
          message: `Erreur fatale: ${error.message}`
        }]
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
