/**
 * AI Prompt System for Code Generation
 * 
 * This module provides sophisticated prompts that instruct the AI to generate
 * actual project files with proper structure and content.
 */

export interface GeneratedFile {
    path: string;
    content: string;
    language?: string;
}

export interface GeneratedProject {
    name: string;
    description: string;
    files: GeneratedFile[];
}

/**
 * Creates a system prompt that instructs the AI to generate actual code files
 */
export function createCodeGenerationPrompt(userRequest: string): string {
    return `You are an expert full-stack developer. Your task is to generate a complete, working project based on the user's request.

USER REQUEST: "${userRequest}"

INSTRUCTIONS:
1. Analyze the request and determine what type of project to build
2. Create a complete, production-ready project with all necessary files
3. Use modern best practices and clean code
4. Include proper file structure and organization
5. Add comments explaining key parts of the code

RESPONSE FORMAT:
You MUST respond with a valid JSON object in this exact format:

{
  "name": "project-name",
  "description": "Brief description of what this project does",
  "files": [
    {
      "path": "index.html",
      "content": "<!DOCTYPE html>...",
      "language": "html"
    },
    {
      "path": "styles.css",
      "content": "body { ... }",
      "language": "css"
    },
    {
      "path": "script.js",
      "content": "// JavaScript code...",
      "language": "javascript"
    }
  ]
}

IMPORTANT RULES:
- Generate ACTUAL, WORKING code - not tutorials or explanations
- Include ALL necessary files for the project to work
- Use relative paths for file references
- Ensure all code is properly formatted
- Add helpful comments in the code
- Make it production-ready and visually appealing
- For web projects, use modern HTML5, CSS3, and vanilla JavaScript (unless specifically requested otherwise)
- Respond ONLY with the JSON object, no additional text

Now generate the project files:`;
}

/**
 * Creates a prompt for improving/modifying existing code
 */
export function createCodeModificationPrompt(
    userRequest: string,
    existingFiles: GeneratedFile[]
): string {
    const filesContext = existingFiles
        .map((f) => `File: ${f.path}\n\`\`\`${f.language || ''}\n${f.content}\n\`\`\``)
        .join('\n\n');

    return `You are an expert developer. Modify the existing project based on the user's request.

USER REQUEST: "${userRequest}"

EXISTING PROJECT FILES:
${filesContext}

INSTRUCTIONS:
1. Analyze the existing code and the modification request
2. Make the necessary changes while preserving existing functionality
3. Maintain code quality and best practices
4. Add new files if needed

RESPONSE FORMAT:
Respond with a valid JSON object containing ALL files (modified and unmodified):

{
  "name": "project-name",
  "description": "Updated description",
  "files": [
    // Include all files here, both modified and unmodified
  ]
}

Respond ONLY with the JSON object:`;
}

/**
 * Validates that the AI response is properly formatted
 */
export function validateGeneratedProject(data: any): data is GeneratedProject {
    if (!data || typeof data !== 'object') return false;
    if (typeof data.name !== 'string') return false;
    if (typeof data.description !== 'string') return false;
    if (!Array.isArray(data.files)) return false;

    return data.files.every((file: any) =>
        typeof file.path === 'string' &&
        typeof file.content === 'string'
    );
}

/**
 * Extracts JSON from AI response that might contain markdown code blocks
 */
export function extractJSON(response: string): any {
    // Try to find JSON in markdown code blocks
    const jsonBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
        return JSON.parse(jsonBlockMatch[1]);
    }

    // Try to find JSON in regular code blocks
    const codeBlockMatch = response.match(/```\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1]);
    }

    // Try to parse the entire response as JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Could not extract JSON from AI response');
}
