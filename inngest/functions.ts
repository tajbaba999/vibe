import { inngest } from "./client";
import { prisma } from "../lib/db";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "./utils";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  createCodeGenerationPrompt,
  extractJSON,
  validateGeneratedProject,
  type GeneratedProject,
} from "../lib/ai/prompts";
import {
  createProjectDir,
  saveFile,
  getProjectPath,
  getLanguageFromPath,
} from "../lib/fs-utils";

export const codeAgentFunction = inngest.createFunction(
  { id: "vibe-code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const userPrompt = String(event.data?.value || "Write a small Next.js component.");

    console.log("➡️ Received prompt:", userPrompt);

    // Step 1: Create project record in database
    const project = await step.run("create-project-record", async () => {
      try {
        console.log("🔌 Testing database connection...");
        await prisma.$connect();
        console.log("✅ Database connected successfully");

        const newProject = await prisma.project.create({
          data: {
            name: userPrompt.slice(0, 100), // Use first 100 chars as name
            prompt: userPrompt,
            status: "generating",
          },
        });

        console.log("📝 Project created:", newProject.id);
        return newProject;
      } catch (error: any) {
        console.error("❌ Database error:", error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          meta: error.meta,
        });
        throw new Error(`Failed to create project: ${error.message}`);
      }
    });

    console.log("📝 Created project:", project.id);

    try {
      // Step 2: Generate code with AI
      const generatedProject = await step.run("generate-code", async () => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("GEMINI_API_KEY missing. Add it in .env and restart.");
        }

        console.log("🤖 Calling Gemini API (Direct)...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

        const systemPrompt = createCodeGenerationPrompt(userPrompt);

        // Add timeout for the API call
        const result = await Promise.race([
          model.generateContent(systemPrompt),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Gemini API timeout after 120 seconds")), 120000)
          )
        ]) as any;

        const response = await result.response;
        const text = response.text();

        console.log("✅ Gemini Response received");

        let projectData;
        try {
          projectData = extractJSON(text);
        } catch (e) {
          console.error("Failed to parse JSON from Gemini response", e);
          throw new Error("Failed to parse JSON from Gemini response");
        }

        if (!validateGeneratedProject(projectData)) {
          throw new Error("Invalid project structure from AI");
        }

        return projectData as GeneratedProject;
      });

      console.log("📦 Generated project:", generatedProject.name);
      console.log("📁 Files count:", generatedProject.files.length);

      // Step 3: Create project directory and save files
      await step.run("save-files", async () => {
        const projectPath = await createProjectDir(project.id);

        console.log("💾 Saving files to:", projectPath);

        // Save all files
        for (const file of generatedProject.files) {
          await saveFile(projectPath, file.path, file.content);
          console.log("  ✓ Saved:", file.path);
        }

        return projectPath;
      });

      // Step 4: Create Sandbox
      const sandboxId = await step.run("create-sandbox", async () => {
        console.log("📦 Creating E2B sandbox...");
        const sandbox = await Sandbox.create("vibe-nextjs-harsh-812");
        console.log("✅ Sandbox created:", sandbox.sandboxId);
        return sandbox.sandboxId;
      });

      // Step 5: Write files to Sandbox
      await step.run("write-to-sandbox", async () => {
        const sandbox = await getSandbox(sandboxId);
        console.log("📝 Writing files to sandbox...");

        for (const file of generatedProject.files) {
          // Ensure directory exists for nested files
          const dir = file.path.substring(0, file.path.lastIndexOf('/'));
          if (dir) {
            await sandbox.files.makeDir(dir);
          }
          await sandbox.files.write(file.path, file.content);
        }
        console.log("✅ Files written to sandbox");
      });

      // Step 6: Get Sandbox URL
      const sandboxUrl = await step.run("get-sandbox-url", async () => {
        const sandbox = await getSandbox(sandboxId);
        const host = sandbox.getHost(3000);
        const url = `https://${host}`;
        console.log("🌐 Sandbox URL:", url);
        return url;
      });

      // Step 7: Save file records to database
      await step.run("save-file-records", async () => {
        const fileRecords = generatedProject.files.map((file) => ({
          projectId: project.id,
          path: file.path,
          content: file.content,
          language: file.language || getLanguageFromPath(file.path),
        }));

        await prisma.file.createMany({
          data: fileRecords,
        });

        console.log("💾 Saved", fileRecords.length, "file records to database");
      });

      // Step 8: Update project status to completed
      await step.run("update-project-status", async () => {
        await prisma.project.update({
          where: { id: project.id },
          data: {
            status: "completed",
            name: generatedProject.name,
            description: generatedProject.description,
            outputPath: getProjectPath(project.id),
          },
        });

        console.log("✅ Project completed!");
      });

      return {
        ok: true,
        projectId: project.id,
        name: generatedProject.name,
        description: generatedProject.description,
        filesCount: generatedProject.files.length,
        timestamp: new Date().toISOString(),
        sandboxUrl,
      };

    } catch (err: any) {
      console.error("❌ Error:", err?.message || err);

      // Update project status to failed
      await step.run("mark-project-failed", async () => {
        await prisma.project.update({
          where: { id: project.id },
          data: {
            status: "failed",
            error: err?.message || "Unknown error",
          },
        });
      });

      throw err;
    }
  }
);

export const functions = [codeAgentFunction];
