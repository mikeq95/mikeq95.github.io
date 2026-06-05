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

// Returns the i18n override frontmatter for a post file, or null if none exists.
function loadI18nOverride(filePath, blogDir, i18nBlogDir) {
  if (!i18nBlogDir) return null;
  const rel = path.relative(blogDir, filePath);
  // Try both same extension and alternate (.md <-> .mdx)
  const candidates = [
    path.join(i18nBlogDir, rel),
    path.join(i18nBlogDir, rel.replace(/\.mdx$/, '.md')),
    path.join(i18nBlogDir, rel.replace(/\.md$/, '.mdx')),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        const { data } = matter(fs.readFileSync(candidate, 'utf8'));
        return data;
      } catch {
        return null;
      }
    }
  }
  return null;
}

module.exports = function blogGlobalDataPlugin(context) {
  return {
    name: 'blog-global-data',
    async loadContent() {
      const blogDir = path.join(context.siteDir, 'blog');
      const tagsMap = loadTagsMap(blogDir);
      const files = findMarkdownFiles(blogDir);
      const posts = [];

      const { currentLocale, defaultLocale } = context.i18n;
      const isDefaultLocale = currentLocale === defaultLocale;
      const i18nBlogDir = !isDefaultLocale
        ? path.join(
            context.siteDir,
            'i18n',
            currentLocale,
            'docusaurus-plugin-content-blog',
          )
        : null;

      for (const filePath of files) {
        try {
          const raw = fs.readFileSync(filePath, 'utf8');
          const { data: fm } = matter(raw);
          if (!fm.title || !fm.date || fm.draft) continue;

          // For non-default locales, skip posts that have no i18n translation —
          // those posts don't have pages in this locale (mirrors Docusaurus behavior).
          const i18nFm = loadI18nOverride(filePath, blogDir, i18nBlogDir);
          if (!isDefaultLocale && !i18nFm) continue;

          // i18n override wins for title / tags / image
          const effectiveFm = i18nFm ? { ...fm, ...i18nFm } : fm;

          const base = path.basename(filePath, path.extname(filePath));
          let permalink;
          if (effectiveFm.slug) {
            const s = effectiveFm.slug.startsWith('/') ? effectiveFm.slug : `/${effectiveFm.slug}`;
            permalink = s.startsWith('/blog') ? s : `/blog${s}`;
          } else {
            const m = base.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
            permalink = m
              ? `/blog/${m[1]}/${m[2]}/${m[3]}/${m[4]}`
              : `/blog/${base}`;
          }

          const rawTags = Array.isArray(effectiveFm.tags) ? effectiveFm.tags : [];
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
            title: effectiveFm.title,
            date: new Date(effectiveFm.date ?? fm.date).toISOString(),
            permalink,
            tags,
            frontMatter: { image: effectiveFm.image },
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
