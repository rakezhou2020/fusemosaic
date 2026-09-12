import { env } from "cloudflare:workers";

export type FuseMosaicEnv = {
  PATTERNS_DB?: D1Database;
  PATTERNS_BUCKET?: R2Bucket;
  IMAGES?: ImagesBinding;
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
};

export function getFuseMosaicEnv(): FuseMosaicEnv {
  return env as unknown as FuseMosaicEnv;
}
