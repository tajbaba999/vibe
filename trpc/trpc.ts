import { initTRPC } from "@trpc/server";
import type { TRPCContext } from "./context";

const t = initTRPC.context<TRPCContext>().create({
  errorFormatter({ shape }) {
    return shape;
  },
});

// Base procedure - can be extended with middleware (auth, logging, etc.)
export const baseProcedure = t.procedure;

// Public procedure alias (for backward compatibility)
export const publicProcedure = t.procedure;

// Create a typed router helper
export const createTRPCRouter = t.router;

// Export other utilities for advanced use cases
export const router = t.router;
export const mergeRouters = t.mergeRouters;
export const createCallerFactory = t.createCallerFactory;

