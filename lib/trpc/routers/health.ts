import { publicProcedure, router } from "@/lib/trpc/trpc";

export const healthRouter = router({
  ping: publicProcedure.query(() => ({
    ok: true,
    timestamp: new Date().toISOString(),
  })),
});

