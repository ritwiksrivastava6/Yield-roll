#!/usr/bin/env node
/**
 * Rolldown rewrites PGLite's `new URL("./pglite.data")` beside the bundled
 * module and does not emit the wasm/data files. Copy them after Nitro's
 * Vercel preset has finished — a `compiled` hook in vite.config replaces
 * that preset hook and drops `.vercel/output/config.json`, so Vercel then
 * looks for a `dist` folder that this app never writes.
 */
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const src = join(root, "node_modules/@electric-sql/pglite/dist");
const dests = [
  join(root, ".vercel/output/functions/__server.func/_libs"),
  join(root, ".output/server/_libs"),
];
const files = ["pglite.data", "pglite.wasm", "initdb.wasm"];

for (const dest of dests) {
  if (!existsSync(dest)) continue;
  for (const file of files) {
    copyFileSync(join(src, file), join(dest, file));
  }
}
