import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter } from "@/lib/trpc/routers/app";
import { createTRPCContext } from "@/lib/trpc/context";

const handler = (request: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createTRPCContext(),
  });
};

export { handler as GET, handler as POST };

