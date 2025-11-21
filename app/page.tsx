"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ProjectViewer } from "@/components/project-viewer";

export default function Home() {
  const [value, setValue] = useState("");
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Fetch projects list
  const { data: projects, refetch: refetchProjects } = trpc.listProjects.useQuery();

  // Fetch current project details
  const { data: currentProject } = trpc.getProject.useQuery(
    { id: currentProjectId! },
    { enabled: !!currentProjectId }
  );

  // Poll for updates when a project is generating
  useEffect(() => {
    if (currentProject?.status === "generating") {
      const interval = setInterval(() => {
        refetchProjects();
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(interval);
    }
  }, [currentProject?.status, refetchProjects]);

  const invoke = trpc.invoke.useMutation({
    onSuccess: (data) => {
      toast.success("Project generation started!", {
        description: `Event ID: ${data.eventId}. Generating your project...`,
        duration: 5000,
      });

      // Refetch projects to show the new one
      setTimeout(() => {
        refetchProjects();
      }, 1000);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start project generation");
    },
  });

  const handleSubmit = () => {
    if (!value.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setCurrentProjectId(null);
    invoke.mutate({
      text: value,
    });
  };

  return (
    <div className="flex flex-col min-h-screen p-8 gap-8">
      {/* Header & Input */}
      <div className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold">AI Code Generator</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Describe what you want to build, and AI will generate the complete project for you
        </p>

        <div className="flex gap-2 w-full">
          <Input
            type="text"
            placeholder="e.g., 'make an anime website' or 'create a todo app'"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            className="flex-1"
          />
          <Button onClick={handleSubmit} disabled={invoke.isPending}>
            {invoke.isPending ? "Starting..." : "Generate"}
          </Button>
        </div>
      </div>

      {/* Current Project Viewer */}
      {currentProject && (
        <ProjectViewer project={currentProject} />
      )}

      {/* Projects List */}
      {projects && projects.length > 0 && (
        <div className="w-full max-w-6xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Recent Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project: any) => (
              <button
                key={project.id}
                onClick={() => setCurrentProjectId(project.id)}
                className={`p-4 bg-white dark:bg-gray-800 rounded-lg border transition-all ${currentProjectId === project.id
                  ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
              >
                <div className="text-left">
                  <h3 className="font-semibold truncate">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    <span className={
                      project.status === "completed" ? "text-green-600 dark:text-green-400" :
                        project.status === "generating" ? "text-yellow-600 dark:text-yellow-400" :
                          project.status === "failed" ? "text-red-600 dark:text-red-400" :
                            "text-gray-600 dark:text-gray-400"
                    }>
                      {project.status}
                    </span>
                    <span>
                      {project._count.files} files
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!projects || projects.length === 0) && !currentProject && (
        <div className="text-center text-gray-500 py-12">
          <p>No projects yet. Generate your first project above!</p>
        </div>
      )}
    </div>
  );
}
