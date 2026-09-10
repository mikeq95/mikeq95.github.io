import { useMemo } from 'react';
import { usePluginData } from '@docusaurus/useGlobalData';

/**
 * All blog posts for the sidebar nav, flattened across categories and
 * sorted newest-first by date.
 */
export function useBlogSidebarPosts() {
  const data = usePluginData('blog-global-data');

  return useMemo(() => {
    const posts = data?.blogPosts ?? [];
    return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data]);
}
