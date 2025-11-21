import fs from 'fs/promises';
import path from 'path';

/**
 * File System Utilities for AI Code Generation
 * 
 * Provides safe file operations for saving generated code
 */

const GENERATED_DIR = path.join(process.cwd(), 'generated');

/**
 * Ensures the generated directory exists
 */
export async function ensureGeneratedDir(): Promise<void> {
    try {
        await fs.access(GENERATED_DIR);
    } catch {
        await fs.mkdir(GENERATED_DIR, { recursive: true });
    }
}

/**
 * Creates a new project directory
 */
export async function createProjectDir(projectId: string): Promise<string> {
    await ensureGeneratedDir();
    const projectPath = path.join(GENERATED_DIR, projectId);
    await fs.mkdir(projectPath, { recursive: true });
    return projectPath;
}

/**
 * Saves a file to the project directory
 * Sanitizes the file path to prevent directory traversal attacks
 */
export async function saveFile(
    projectPath: string,
    filePath: string,
    content: string
): Promise<void> {
    // Sanitize the file path to prevent directory traversal
    const sanitizedPath = filePath.replace(/\.\./g, '').replace(/^\//, '');
    const fullPath = path.join(projectPath, sanitizedPath);

    // Ensure the directory exists
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    // Write the file
    await fs.writeFile(fullPath, content, 'utf-8');
}

/**
 * Reads a file from the project directory
 */
export async function readFile(
    projectPath: string,
    filePath: string
): Promise<string> {
    const sanitizedPath = filePath.replace(/\.\./g, '').replace(/^\//, '');
    const fullPath = path.join(projectPath, sanitizedPath);
    return await fs.readFile(fullPath, 'utf-8');
}

/**
 * Lists all files in a project directory recursively
 */
export async function listFiles(projectPath: string): Promise<string[]> {
    const files: string[] = [];

    async function walk(dir: string, basePath: string = ''): Promise<void> {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const relativePath = path.join(basePath, entry.name);
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await walk(fullPath, relativePath);
            } else {
                files.push(relativePath);
            }
        }
    }

    await walk(projectPath);
    return files;
}

/**
 * Deletes a project directory and all its contents
 */
export async function deleteProject(projectId: string): Promise<void> {
    const projectPath = path.join(GENERATED_DIR, projectId);
    await fs.rm(projectPath, { recursive: true, force: true });
}

/**
 * Gets the absolute path for a project
 */
export function getProjectPath(projectId: string): string {
    return path.join(GENERATED_DIR, projectId);
}

/**
 * Determines the programming language from file extension
 */
export function getLanguageFromPath(filePath: string): string | undefined {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap: Record<string, string> = {
        '.js': 'javascript',
        '.jsx': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.html': 'html',
        '.css': 'css',
        '.scss': 'scss',
        '.json': 'json',
        '.md': 'markdown',
        '.py': 'python',
        '.java': 'java',
        '.go': 'go',
        '.rs': 'rust',
        '.php': 'php',
        '.rb': 'ruby',
        '.sql': 'sql',
        '.sh': 'bash',
        '.yml': 'yaml',
        '.yaml': 'yaml',
    };

    return languageMap[ext];
}
