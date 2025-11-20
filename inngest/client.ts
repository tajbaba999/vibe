import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "vibe",
  // Event key is required for sending events to Inngest Cloud
  // For local development with Inngest Dev Server, leave undefined
  // For Inngest Cloud, set INNGEST_EVENT_KEY in .env
  eventKey: process.env.INNGEST_EVENT_KEY,
  // Base URL for Inngest (defaults to cloud, set to local dev server URL if needed)
  // For local dev: set INNGEST_BASE_URL=http://localhost:8288
  baseURL: process.env.INNGEST_BASE_URL,
});