"use client";

import { trpc } from "@/lib/trpc/client";

export const Client = () => {
  const { data } = trpc.health.ping.useQuery();

  return <div>{data?.timestamp}</div>;
};