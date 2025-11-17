import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "@/lib/trpc/routers/app";

export const trpc = createTRPCReact<AppRouter>();

