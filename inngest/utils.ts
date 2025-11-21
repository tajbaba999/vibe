import { Sandbox } from "@e2b/code-interpreter";

export async function getSandbox(sandboxId: string) {
    const sanbox = Sandbox.connect(sandboxId);
    return sanbox;
}