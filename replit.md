# Overview

This is a full-stack web application designed to upload ZIP files and synchronize their contents to GitHub repositories. The application provides a modern interface for managing file uploads to GitHub with real-time progress tracking, job monitoring, and detailed logging capabilities. Built with a React frontend and Express backend, it offers a seamless experience for developers who need to bulk upload files to their GitHub repositories.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for type safety and modern development experience
- **Vite** as the build tool for fast development and optimized production builds
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query** for efficient server state management, caching, and data fetching
- **Tailwind CSS** with custom CSS variables for consistent styling and theming
- **Shadcn/ui** component library built on Radix UI primitives for accessible, customizable components
- **React Hook Form** with Zod resolvers for form validation and management

## Backend Architecture
- **Express.js** server with TypeScript for API endpoints and middleware
- **RESTful API** design for handling upload jobs and GitHub operations
- **Multer** middleware for handling multipart file uploads (ZIP files up to 100MB)
- **In-memory storage** using a custom storage interface for upload job persistence
- **Real-time logging** system with structured log levels (info, warn, error)
- **File processing** with JSZip for extracting and handling ZIP file contents

## Data Management
- **Drizzle ORM** configured for PostgreSQL with schema-first approach
- **Zod schemas** for runtime type validation shared between frontend and backend
- **Type-safe** data models with TypeScript interfaces generated from Zod schemas
- **Database migrations** managed through Drizzle Kit

## Authentication & Security
- **GitHub Personal Access Token** based authentication for repository access
- **Token validation** against GitHub API before processing uploads
- **Repository permission verification** to ensure write access
- **File type restrictions** limiting uploads to ZIP files only
- **File size limits** enforced at 100MB maximum

## File Processing Pipeline
1. **Upload validation** - ZIP file format and size verification
2. **GitHub access verification** - Token and repository permission validation  
3. **ZIP extraction** - Content extraction with structure preservation options
4. **Batch upload** - Individual file commits to GitHub with progress tracking
5. **Error handling** - Detailed error reporting and recovery mechanisms

## External Dependencies

### GitHub Integration
- **Octokit REST API** for all GitHub repository operations
- **Repository access validation** using GitHub's API endpoints
- **Individual file commits** with custom commit messages
- **Branch targeting** with configurable target branches (default: main)

### Database & Storage
- **Neon Database** serverless PostgreSQL for production data persistence
- **Connection pooling** via Neon's serverless driver
- **Environment-based configuration** for database connections

### Development Tools
- **Replit integration** with specialized plugins for development environment
- **Vite plugins** for runtime error handling and cartographer integration
- **TypeScript compilation** with strict mode and modern ES modules

### UI Components & Styling
- **Radix UI primitives** for accessible component foundations
- **Lucide React** for consistent iconography
- **Class Variance Authority** for component variant management
- **Date-fns** for date manipulation and formatting

### Build & Deployment
- **ESBuild** for server-side bundle optimization
- **PostCSS** with Autoprefixer for CSS processing
- **Node.js ESM** module system throughout the application