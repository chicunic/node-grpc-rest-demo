// Post-processes proto-loader-gen-types output to add .js extensions
// for ESM nodenext compatibility.

import { globSync, readFileSync, writeFileSync } from "node:fs";

const files = globSync("src/generated/**/*.ts");
const importRegex = /(from\s+['"])(\.{1,2}\/[^'"]+?)(['"])/g;

for (const file of files) {
  const original = readFileSync(file, "utf8");
  const patched = original.replace(importRegex, (match, prefix, path, suffix) => {
    if (/\.(js|json|ts|cjs|mjs)$/.test(path)) return match;
    return `${prefix}${path}.js${suffix}`;
  });
  if (patched !== original) {
    writeFileSync(file, patched);
  }
}
