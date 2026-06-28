import { useMemo } from 'react';
import { usePluginData } from '@docusaurus/useGlobalData';

export function useBlogTitleMap() {
  const data = usePluginData('blog-global-data');
  return useMemo(() => {
    const map = new Map();
    (data?.blogPosts ?? []).forEach(post => {
      if (post.permalink) {
        map.set(post.permalink, {
          title: post.title,
          image: post.frontMatter?.image ?? null,
          tags:  post.tags ?? [],
        });
      }
    });
    return map;
  }, [data]);
}
