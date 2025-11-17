import { db } from "@/lib/db";

export type TRPCContext = {
  db: typeof db;
};

export async function createTRPCContext(): Promise<TRPCContext> {
  return {
    db,
  };
}

