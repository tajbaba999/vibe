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
      await inngest.send({
        name: "test/hello.world",
        data: {
          email: input.text,
        },
      });

      return {
        success: true,
        message: `Event sent for ${input.text}`,
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

