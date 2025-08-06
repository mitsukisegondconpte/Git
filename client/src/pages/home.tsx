import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Github, 
  Upload, 
  FileArchive, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Settings, 
  Terminal,
  Eye,
  EyeOff,
  Key,
  Lightbulb,
  Info,
  Download,
  ExpandIcon
} from "lucide-react";

interface UploadJob {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  currentFile?: string;
  filesProcessed: number;
  totalFiles: number;
  logs: Array<{
    timestamp: string;
    level: "info" | "warn" | "error";
    message: string;
  }>;
  error?: string;
}

export default function Home() {
  const [githubToken, setGithubToken] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [targetBranch, setTargetBranch] = useState("main");
  const [commitMessage, setCommitMessage] = useState("");
  const [preserveStructure, setPreserveStructure] = useState(true);
  const [overwriteFiles, setOverwriteFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for job status
  const { data: jobData } = useQuery<{ success: boolean; job: UploadJob }>({
    queryKey: ["/api/upload", currentJobId],
    enabled: !!currentJobId,
    refetchInterval: currentJobId ? 1000 : false,
  });

  // Validate GitHub connection
  const validateGitHubMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/github/validate", {
        token: githubToken,
        repositoryUrl: repositoryUrl
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setIsValidated(true);
        toast({
          title: "Succès!",
          description: "Connexion GitHub validée avec succès.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de validation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create project ZIP
  const createProjectZipMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/project-zip/create");
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'github-uploader-project.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "ZIP du projet créé",
        description: "Le projet complet a été téléchargé.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le ZIP du projet.",
        variant: "destructive",
      });
    },
  });

  // Create test ZIP
  const createTestZipMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/test-zip/create");
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test-project.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "ZIP de test créé",
        description: "Le fichier test-project.zip a été téléchargé.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le fichier ZIP de test.",
        variant: "destructive",
      });
    },
  });

  // Upload file
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("Aucun fichier sélectionné");
      
      const formData = new FormData();
      formData.append('zipFile', selectedFile);
      formData.append('jobData', JSON.stringify({
        githubToken,
        repositoryUrl,
        targetBranch,
        commitMessage: commitMessage || `Ajout de nouveaux fichiers via ZIP upload`,
        preserveStructure,
        overwriteFiles
      }));

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur d'upload");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setCurrentJobId(data.jobId);
        toast({
          title: "Upload démarré",
          description: "Le processus d'upload a commencé avec succès.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'upload",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = useCallback((file: File) => {
    if (file.type === "application/zip" || file.name.endsWith('.zip')) {
      setSelectedFile(file);
      toast({
        title: "Fichier sélectionné",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      });
    } else {
      toast({
        title: "Type de fichier invalide",
        description: "Seuls les fichiers ZIP sont acceptés.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const canUpload = isValidated && selectedFile && githubToken && repositoryUrl;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <div className="h-2 w-2 bg-gray-400 rounded-full" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Terminé";
      case "failed":
        return "Échoué";
      case "processing":
        return "En cours";
      default:
        return "En attente";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Github className="h-8 w-8 text-gray-900 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Téléchargeur GitHub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Interface sécurisée</span>
              <Shield className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Info className="h-6 w-6 text-blue-500 mt-1" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Upload de fichiers ZIP vers GitHub</h2>
                <p className="text-gray-600 mb-4">
                  Cette application vous permet d'extraire et d'organiser automatiquement le contenu d'un fichier ZIP vers un dépôt GitHub en préservant la structure des dossiers.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Vos tokens ne sont jamais stockés - Sécurité garantie</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2">
            {/* GitHub Token Section */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Key className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">1. Configuration GitHub</h3>
                  <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Requis
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="github-token" className="text-sm font-medium text-gray-700">
                      Token d'API GitHub <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="github-token"
                        type={showToken ? "text" : "password"}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        value={githubToken}
                        onChange={(e) => {
                          setGithubToken(e.target.value);
                          setIsValidated(false);
                        }}
                        className="pr-12"
                        data-testid="input-github-token"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowToken(!showToken)}
                        data-testid="button-toggle-token-visibility"
                      >
                        {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Créer un token GitHub avec les permissions 'repo' et 'contents'
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="repo-url" className="text-sm font-medium text-gray-700">
                      URL du dépôt GitHub <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="repo-url"
                      type="url"
                      placeholder="https://github.com/utilisateur/nom-depot"
                      value={repositoryUrl}
                      onChange={(e) => {
                        setRepositoryUrl(e.target.value);
                        setIsValidated(false);
                      }}
                      className="mt-2"
                      data-testid="input-repo-url"
                    />
                  </div>

                  <Button
                    onClick={() => validateGitHubMutation.mutate()}
                    disabled={!githubToken || !repositoryUrl || validateGitHubMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid="button-validate-github"
                  >
                    {validateGitHubMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Validation en cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Valider la connexion GitHub
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* File Upload Section */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <FileArchive className="h-6 w-6 text-purple-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">2. Sélection du fichier ZIP</h3>
                </div>

                {/* File Drop Zone */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDrop={handleFileDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => document.getElementById('file-input')?.click()}
                  data-testid="drop-zone"
                >
                  <div className="space-y-4">
                    <div className="mx-auto h-16 w-16 text-gray-400">
                      <Upload className="h-16 w-16" />
                    </div>
                    <div>
                      <p className="text-lg text-gray-600 font-medium">Glissez votre fichier ZIP ici</p>
                      <p className="text-sm text-gray-500">ou cliquez pour sélectionner un fichier</p>
                    </div>
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        data-testid="button-choose-file"
                      >
                        <FileArchive className="h-4 w-4 mr-2" />
                        Choisir un fichier
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400">Maximum 100MB • Formats acceptés: .zip</p>
                  </div>
                </div>

                <input
                  id="file-input"
                  type="file"
                  accept=".zip"
                  onChange={handleFileInput}
                  className="hidden"
                  data-testid="input-file"
                />

                {/* Selected File Display */}
                {selectedFile && (
                  <div className="mt-4" data-testid="selected-file">
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <FileArchive className="h-6 w-6 text-purple-600 mr-3" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate" data-testid="text-file-name">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500" data-testid="text-file-size">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Sélectionné
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        data-testid="button-remove-file"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload Options Section */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Settings className="h-6 w-6 text-gray-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">3. Options d'upload</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="target-branch" className="text-sm font-medium text-gray-700">
                      Branche de destination
                    </Label>
                    <Input
                      id="target-branch"
                      value={targetBranch}
                      onChange={(e) => setTargetBranch(e.target.value)}
                      className="mt-2"
                      data-testid="input-target-branch"
                    />
                  </div>

                  <div>
                    <Label htmlFor="commit-message" className="text-sm font-medium text-gray-700">
                      Message de commit
                    </Label>
                    <Input
                      id="commit-message"
                      placeholder="Ajout de nouveaux fichiers via ZIP upload"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      className="mt-2"
                      data-testid="input-commit-message"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="preserve-structure"
                        checked={preserveStructure}
                        onCheckedChange={(checked) => setPreserveStructure(checked as boolean)}
                        data-testid="checkbox-preserve-structure"
                      />
                      <Label htmlFor="preserve-structure" className="text-sm text-gray-700">
                        Préserver la structure des dossiers
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="overwrite-files"
                        checked={overwriteFiles}
                        onCheckedChange={(checked) => setOverwriteFiles(checked as boolean)}
                        data-testid="checkbox-overwrite-files"
                      />
                      <Label htmlFor="overwrite-files" className="text-sm text-gray-700">
                        Écraser les fichiers existants
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Button */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={() => uploadMutation.mutate()}
                  disabled={!canUpload || uploadMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-4"
                  data-testid="button-start-upload"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Clock className="h-5 w-5 mr-3 animate-spin" />
                      Upload en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-3" />
                      Commencer l'upload vers GitHub
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Vérifiez que tous les champs requis sont remplis avant de continuer
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Status and Logs */}
          <div className="lg:col-span-1">
            {/* Status Panel */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-6 w-6 text-indigo-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">Statut</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Connexion GitHub</span>
                    <span className="flex items-center text-xs">
                      {isValidated ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-600">Validé</span>
                        </>
                      ) : (
                        <>
                          <div className="h-2 w-2 bg-gray-400 rounded-full mr-1" />
                          <span className="text-gray-500">En attente</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Fichier ZIP</span>
                    <span className="flex items-center text-xs">
                      {selectedFile ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-600">Sélectionné</span>
                        </>
                      ) : (
                        <>
                          <div className="h-2 w-2 bg-gray-400 rounded-full mr-1" />
                          <span className="text-gray-500">Non sélectionné</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Upload</span>
                    <span className="flex items-center text-xs">
                      {jobData?.job ? (
                        <>
                          {getStatusIcon(jobData.job.status)}
                          <span className={`ml-1 ${
                            jobData.job.status === 'completed' ? 'text-green-600' :
                            jobData.job.status === 'failed' ? 'text-red-600' :
                            jobData.job.status === 'processing' ? 'text-blue-600' :
                            'text-gray-500'
                          }`}>
                            {getStatusText(jobData.job.status)}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="h-2 w-2 bg-gray-400 rounded-full mr-1" />
                          <span className="text-gray-500">Prêt</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Panel */}
            {jobData?.job && jobData.job.status === 'processing' && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <Clock className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900">Progression</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-700 mb-1">
                        <span>Extraction et upload</span>
                        <span data-testid="text-progress-percentage">{jobData.job.progress}%</span>
                      </div>
                      <Progress value={jobData.job.progress} className="h-2" />
                    </div>

                    <div className="text-sm text-gray-600">
                      {jobData.job.currentFile && (
                        <p>
                          <span className="font-medium" data-testid="text-current-file">
                            {jobData.job.currentFile}
                          </span>
                        </p>
                      )}
                      <p className="text-xs mt-1" data-testid="text-files-processed">
                        {jobData.job.filesProcessed} / {jobData.job.totalFiles} fichiers traités
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Logs Panel */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Terminal className="h-6 w-6 text-gray-600 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900">Logs d'opération</h3>
                  </div>
                  <Button variant="ghost" size="sm" data-testid="button-expand-logs">
                    <ExpandIcon className="h-4 w-4" />
                  </Button>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2 text-sm font-mono">
                    {jobData?.job?.logs?.length ? (
                      jobData.job.logs.map((log, index) => (
                        <div key={index} className="text-gray-400" data-testid={`log-entry-${index}`}>
                          <span className="text-blue-400">
                            [{new Date(log.timestamp).toLocaleTimeString()}]
                          </span>
                          <span className={`ml-2 ${
                            log.level === 'error' ? 'text-red-400' :
                            log.level === 'warn' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            [{log.level.toUpperCase()}]
                          </span>
                          <span className="ml-1">{log.message}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="text-gray-400" data-testid="log-initial">
                          <span className="text-blue-400">[{new Date().toLocaleTimeString()}]</span>
                          <span className="text-green-400 ml-2">[INFO]</span>
                          <span className="ml-1">Application initialisée</span>
                        </div>
                        <div className="text-gray-400" data-testid="log-waiting">
                          <span className="text-blue-400">[{new Date().toLocaleTimeString()}]</span>
                          <span className="text-green-400 ml-2">[INFO]</span>
                          <span className="ml-1">En attente de configuration GitHub...</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                  <span>Logs en temps réel</span>
                  <Button variant="ghost" size="sm" data-testid="button-export-logs">
                    <Download className="h-3 w-3 mr-1" />
                    Exporter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Download Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Project ZIP Section */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Download className="h-6 w-6 text-purple-600 mt-1" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-purple-900 mb-2">Télécharger le projet complet</h3>
                  <p className="text-purple-700 mb-4">
                    Obtenez une copie complète du code source de cette application web.
                  </p>
                  <Button
                    onClick={() => createProjectZipMutation.mutate()}
                    disabled={createProjectZipMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    data-testid="button-download-project"
                  >
                    {createProjectZipMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger le projet
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test ZIP Section */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Lightbulb className="h-6 w-6 text-blue-600 mt-1" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Créer un fichier ZIP de test</h3>
                  <p className="text-blue-700 mb-4">
                    Générez un fichier ZIP d'exemple pour tester le processus d'upload.
                  </p>
                  <Button
                    onClick={() => createTestZipMutation.mutate()}
                    disabled={createTestZipMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    data-testid="button-create-test-zip"
                  >
                    {createTestZipMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <FileArchive className="h-4 w-4 mr-2" />
                        Générer un ZIP de test
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
