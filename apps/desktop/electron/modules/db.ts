const path = require("path");

let prismaInstance: any = null;

export async function getPrisma() {
  if (!prismaInstance) {
    const clientPath = path.resolve(__dirname, "../../../src/lib/db/client");
    const mod = require(clientPath);
    prismaInstance = mod.prisma;
  }
  return prismaInstance;
}
