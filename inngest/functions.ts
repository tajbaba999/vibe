import { inngest } from "./client";


export const helloWorld = inngest.createFunction(
    {id : "hello-world"},
    {event: "vibe/hello-world"},
    async ({ event,  step }) => {
     await step.run("hello-world", async() =>{
        return { message: `Hello ${event.data.name}!` };
    });
  },
);

export const functions = [helloWorld];