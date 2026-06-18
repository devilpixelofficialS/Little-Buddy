const path = require("path");

let runtimeInstance: any = null;

export async function getAgentRuntime() {
  if (!runtimeInstance) {
    const runtimePath = path.resolve(__dirname, "../../../src/agents/runtime");
    const mod = require(runtimePath);
    runtimeInstance = mod.getAgentRuntime();
  }
  return runtimeInstance;
}
