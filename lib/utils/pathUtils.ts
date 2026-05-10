import path from "path";
import os from "os";

export function getGeneratedBasePath(): string {
  // In serverless environments like Vercel, the filesystem is read-only except for /tmp
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), "generated");
  }
  return path.join(process.cwd(), "generated");
}
