import { prisma } from "@/lib/db";

export type TRPCContext = {
  db: typeof prisma;
};

export async function createTRPCContext(): Promise<TRPCContext> {
  return {
    db: prisma,
  };
}

