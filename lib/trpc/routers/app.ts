import { mergeRouters, router } from "@/lib/trpc/trpc";
import { healthRouter } from "@/lib/trpc/routers/health";

export const appRouter = mergeRouters(
  router({
    health: healthRouter,
  }),
);

export type AppRouter = typeof appRouter;

