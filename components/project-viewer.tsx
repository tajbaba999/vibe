"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface File {
    id: string;
    path: string;
    content: string;
    language: string | null;
}

interface Project {
    id: string;
    name: string;
    description: string | null;
    status: string;
    files: File[];
    createdAt: Date;
}

interface ProjectViewerProps {
    project: Project;
}

export function ProjectViewer({ project }: ProjectViewerProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(
        project.files[0] || null
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "text-green-600 dark:text-green-400";
            case "generating":
                return "text-yellow-600 dark:text-yellow-400";
            case "failed":
                return "text-red-600 dark:text-red-400";
            default:
                return "text-gray-600 dark:text-gray-400";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return "✓";
            case "generating":
                return "⏳";
            case "failed":
                return "✗";
            default:
                return "○";
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-4">
            {/* Project Header */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold">{project.name}</h2>
                        {project.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {project.description}
                            </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className={`font-medium ${getStatusColor(project.status)}`}>
                                {getStatusIcon(project.status)} {project.status.toUpperCase()}
                            </span>
                            <span className="text-gray-500">
                                {project.files.length} files
                            </span>
                            <span className="text-gray-500">
                                {new Date(project.createdAt).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* File Browser */}
            {project.files.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* File Tree */}
                    <div className="md:col-span-1 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold mb-3 text-sm">Files</h3>
                        <div className="space-y-1">
                            {project.files.map((file) => (
                                <button
                                    key={file.id}
                                    onClick={() => setSelectedFile(file)}
                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedFile?.id === file.id
                                            ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    <span className="font-mono text-xs">{file.path}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Code Preview */}
                    <div className="md:col-span-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        {selectedFile ? (
                            <>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm font-mono">
                                        {selectedFile.path}
                                    </h3>
                                    {selectedFile.language && (
                                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                            {selectedFile.language}
                                        </span>
                                    )}
                                </div>
                                <pre className="p-4 bg-gray-50 dark:bg-gray-900 rounded overflow-x-auto text-sm">
                                    <code>{selectedFile.content}</code>
                                </pre>
                            </>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                Select a file to preview
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
