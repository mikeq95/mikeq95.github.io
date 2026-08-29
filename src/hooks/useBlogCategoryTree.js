import { useMemo } from 'react';
import { usePluginData } from '@docusaurus/useGlobalData';

// Display order and label for each blog/<folder> category. "Other" is a
// catch-all and sorts last regardless of post count.
const CATEGORY_ORDER = ['Github', 'Claude-Code', 'Macos', 'Life', 'English', 'Other'];
const CATEGORY_LABELS = {
  Github: 'GitHub',
  'Claude-Code': 'Claude Code',
  Macos: 'macOS',
  Life: 'Life',
  English: 'English',
  Other: 'Other',
};

/**
 * Groups the blog's global post list by its `category` field (the post's
 * top-level `blog/` subfolder) into blume-style nav-tree groups, each post
 * sorted newest-first within its group.
 */
export function useBlogCategoryTree() {
  const data = usePluginData('blog-global-data');

  return useMemo(() => {
    const posts = data?.blogPosts ?? [];
    const byCategory = new Map();

    for (const post of posts) {
      const key = post.category ?? 'Other';
      if (!byCategory.has(key)) {
        byCategory.set(key, []);
      }
      byCategory.get(key).push(post);
    }

    for (const group of byCategory.values()) {
      group.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const orderedKeys = [
      ...CATEGORY_ORDER.filter(key => byCategory.has(key)),
      ...[...byCategory.keys()].filter(key => !CATEGORY_ORDER.includes(key)),
    ];

    return orderedKeys.map(key => ({
      id: key,
      label: CATEGORY_LABELS[key] ?? key,
      posts: byCategory.get(key),
    }));
  }, [data]);
}
