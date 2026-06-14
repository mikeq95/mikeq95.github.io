const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

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

module.exports = function postsMetaPlugin(context) {
  return {
    name: 'posts-meta-plugin',
    // Runs during both `docusaurus build` and `docusaurus start` (dev).
    async loadContent() {
      const blogDir = path.join(context.siteDir, 'blog');
      const files = findMarkdownFiles(blogDir);
      const meta = {};

      for (const filePath of files) {
        try {
          const { data: fm } = matter(fs.readFileSync(filePath, 'utf8'));
          // slug is required as the key; skip files without one.
          if (!fm.slug) continue;
          meta[fm.slug] = {
            title: fm.title ?? null,
            image: fm.image ?? null,
          };
        } catch {
          // skip unparseable files
        }
      }

      // Write to static/ so it is served as-is in dev mode and copied to
      // build/posts-meta.json automatically on production builds.
      const outPath = path.join(context.siteDir, 'static', 'posts-meta.json');
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify(meta, null, 2), 'utf8');

      return meta;
    },
  };
};
