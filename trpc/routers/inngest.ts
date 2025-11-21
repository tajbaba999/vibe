import { publicProcedure, router } from "@/trpc/trpc";
import { z } from "zod";
import { inngest } from "@/inngest/client";

export const inngestRouter = router({
  sendHelloWorld: publicProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await inngest.send({
        name: "",
        data: {
          name: input.name,
        },
      });

      return {
        success: true,
        message: `Event sent for ${input.name}`,
      };
    }),
});

