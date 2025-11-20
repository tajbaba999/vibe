import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter } from "@/trpc/routers/app";
import { createTRPCContext } from "@/trpc/context";

const handler = (request: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: async () => createTRPCContext(),
  });
};



export { handler as GET, handler as POST };

