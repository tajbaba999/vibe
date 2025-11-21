import { inngest } from "./client";
import { gemini, createAgent } from "@inngest/agent-kit";
import { prisma } from "../lib/db";
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

        console.log("🤖 Creating Gemini agent...");
        const agent = createAgent({
          name: "code-generator",
          system: createCodeGenerationPrompt(userPrompt),
          model: gemini({ model: "gemini-1.5-pro", apiKey }),
        });

        console.log("🤖 Calling Gemini API...");
        const startTime = Date.now();

        try {
          // Add timeout to prevent hanging
          const response: any = await Promise.race([
            agent.run("Generate the project now."),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Gemini API timeout after 120 seconds")), 120000)
            )
          ]);

          const duration = ((Date.now() - startTime) / 1000).toFixed(2);
          console.log(`✅ Gemini Response received in ${duration}s`);

          // Extract response text
          let responseText = "";
          if (typeof response === "string") {
            responseText = response;
          } else if (Array.isArray(response.output)) {
            for (const msg of response.output) {
              if (msg.role === "assistant" && "content" in msg && msg.content) {
                if (typeof msg.content === "string") {
                  responseText += msg.content;
                } else if (Array.isArray(msg.content)) {
                  responseText += msg.content.map((c: any) => c.text || "").join("");
                }
              }
            }
          } else {
            responseText = JSON.stringify(response);
          }

          console.log("📄 Response length:", responseText.length);

          // Extract and validate JSON
          const projectData = extractJSON(responseText);

          if (!validateGeneratedProject(projectData)) {
            throw new Error("Invalid project structure from AI");
          }

          return projectData as GeneratedProject;
        } catch (error: any) {
          console.error("❌ Gemini API error:", error);
          console.error("Error details:", {
            message: error.message,
            name: error.name,
            stack: error.stack?.split('\n').slice(0, 3).join('\n'),
          });
          throw error;
        }
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

      // Step 4: Save file records to database
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

      // Step 5: Update project status to completed
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
