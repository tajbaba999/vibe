"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/client";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [value, setValue] = useState("");
  const [lastResponse, setLastResponse] = useState<any>(null);

  const invoke = trpc.invoke.useMutation({
    onSuccess: (data) => {
      // Log the full response object
      console.log("Full response data:", data);
      // console.log("Success:", data.success);
      // console.log("Message:", data.message);
      
      // Store the response for display
      setLastResponse(data);
      
      // Show the response message from the server
      toast.success(data.message || "Background job started successfully!", {
        description: `Event ID: ${data.eventId || "N/A"}. Check Inngest logs for function result.`,
        duration: 5000,
      });
    },
    onError: (error) => {
      // Log the full error object
      console.error("Full error:", error);
      console.error("Error message:", error.message);
      console.error("Error shape:", error.shape);
      
      toast.error(error.message || "Failed to start background job");
    },
  });

  const handleSubmit = () => {
    if (!value.trim()) {
      toast.error("Please enter a value");
      return;
    }

    setLastResponse(null);
    invoke.mutate({
      text: value,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <h1 className="text-2xl font-bold">Code Generator</h1>
        <Input
          type="text"
          placeholder="Enter your request (e.g., 'make a anime website')"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
        />
        <Button onClick={handleSubmit} disabled={invoke.isPending} className="w-full">
          {invoke.isPending ? "Generating..." : "Generate Code"}
        </Button>

        {lastResponse && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-full">
            <h3 className="font-semibold mb-2">Event Sent:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(lastResponse, null, 2)}
            </pre>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              ⚡ The Inngest function is processing your request asynchronously.
              <br />
              Check the Inngest Dev Server logs or dashboard to see the generated result.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


