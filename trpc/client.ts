import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/trpc/routers/app";

export const trpc = createTRPCReact<AppRouter>();

