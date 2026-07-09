// docusaurus-plugin-llms doesn't strip MDX/JSX comments (only `import`
// statements via excludeImports), so markers like `{/* truncate */}` leak
// into the generated llms.txt / llms-full.txt as literal text. This runs
// as a postbuild step to clean them out of the build output.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(__dirname, '..', 'build');

function findLlmsFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findLlmsFiles(full));
    } else if (/^llms(-full)?\.txt$/.test(entry)) {
      results.push(full);
    }
  }
  return results;
}

const files = findLlmsFiles(buildDir);
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const cleaned = content
    .replace(/\{\/\*.*?\*\/\}\n?/gs, '')
    .replace(/\n{3,}/g, '\n\n');
  if (cleaned !== content) {
    writeFileSync(file, cleaned);
    console.log(`[clean-llms-txt] cleaned ${path.relative(buildDir, file)}`);
  }
}
