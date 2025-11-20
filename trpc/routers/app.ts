import { z } from "zod";
import { baseProcedure, createTRPCRouter, mergeRouters } from "@/trpc/trpc";
import { inngest } from "@/inngest/client";
import { healthRouter } from "@/trpc/routers/health";
import { inngestRouter } from "@/trpc/routers/inngest";

const mainRouter = createTRPCRouter({
  invoke: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const eventId = await inngest.send({
        name: "code-agent/run",   
        data: {
          value: input.text,     
        },
      });

      return {
        success: true,
        message: `Event sent for ${input.text}`,
        eventId: eventId?.ids?.[0] || "unknown",
        timestamp: new Date().toISOString(),
      };
    }),

  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
});

// Merge with existing modular routers
const modularRouters = createTRPCRouter({
  health: healthRouter,
  inngest: inngestRouter,
});

// Combine all routers
export const appRouter = mergeRouters(mainRouter, modularRouters);

// Export type definition of API
export type AppRouter = typeof appRouter;
