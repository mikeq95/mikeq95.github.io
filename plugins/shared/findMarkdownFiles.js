const fs = require('fs');
const path = require('path');

// Recursively collect all .md / .mdx files under a directory.
function findMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findMarkdownFiles(fp));
    else if (/\.(md|mdx)$/.test(entry.name)) results.push(fp);
  }
  return results;
}

module.exports = { findMarkdownFiles };
