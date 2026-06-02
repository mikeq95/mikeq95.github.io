const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const yaml = require('js-yaml');

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

function loadTagsMap(blogDir) {
  const tagsFile = path.join(blogDir, 'tags.yml');
  if (!fs.existsSync(tagsFile)) return {};
  try {
    return yaml.load(fs.readFileSync(tagsFile, 'utf8')) || {};
  } catch {
    return {};
  }
}

module.exports = function blogGlobalDataPlugin(context) {
  return {
    name: 'blog-global-data',
    async loadContent() {
      const blogDir = path.join(context.siteDir, 'blog');
      const tagsMap = loadTagsMap(blogDir);
      const files = findMarkdownFiles(blogDir);
      const posts = [];

      for (const filePath of files) {
        try {
          const raw = fs.readFileSync(filePath, 'utf8');
          const { data: fm } = matter(raw);
          if (!fm.title || !fm.date || fm.draft) continue;

          const base = path.basename(filePath, path.extname(filePath));
          let permalink;
          if (fm.slug) {
            const s = fm.slug.startsWith('/') ? fm.slug : `/${fm.slug}`;
            permalink = s.startsWith('/blog') ? s : `/blog${s}`;
          } else {
            const m = base.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
            permalink = m
              ? `/blog/${m[1]}/${m[2]}/${m[3]}/${m[4]}`
              : `/blog/${base}`;
          }

          const rawTags = Array.isArray(fm.tags) ? fm.tags : [];
          const tags = rawTags.map(key => {
            const def = tagsMap[key];
            const label = def?.label ?? String(key);
            const tagPermalink = def?.permalink
              ? `/blog/tags${def.permalink}`
              : `/blog/tags/${String(key).toLowerCase().replace(/\s+/g, '-')}`;
            return { label, permalink: tagPermalink };
          });

          posts.push({
            id: path.relative(blogDir, filePath),
            title: fm.title,
            date: new Date(fm.date).toISOString(),
            permalink,
            tags,
          });
        } catch {
          // skip unparseable files
        }
      }

      return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    async contentLoaded({ content, actions }) {
      actions.setGlobalData({ blogPosts: content });
    },
  };
};
