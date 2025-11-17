import { initTRPC } from "@trpc/server";

import type { TRPCContext } from "@/lib/trpc/context";

const t = initTRPC.context<TRPCContext>().create({
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const mergeRouters = t.mergeRouters;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

