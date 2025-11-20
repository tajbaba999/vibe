import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import  { codeAgentFunction } from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [codeAgentFunction],
  // Signing key is required for production/cloud
  // For local development with Inngest Dev Server, this is optional
  signingKey: process.env.INNGEST_SIGNING_KEY,
});