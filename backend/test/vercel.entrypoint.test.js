import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const entrypointPath = resolve(testDirectory, "../api/index.js");

test("Vercel entrypoint exports the Express app without local startup behavior", async () => {
  const source = await readFile(entrypointPath, "utf8");

  assert.match(source, /export default app/);
  assert.doesNotMatch(source, /app\.listen\s*\(/);
  assert.doesNotMatch(source, /checkDatabaseConnection/);
  assert.doesNotMatch(source, /process\.exit\s*\(/);
});

