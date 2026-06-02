import { useAllPluginInstancesData } from '@docusaurus/useGlobalData';

export function useBlogTitleMap() {
  const allData = useAllPluginInstancesData('docusaurus-plugin-content-blog');
  const map = new Map();

  if (allData) {
    for (const instanceData of Object.values(allData)) {
      const posts = instanceData?.posts ?? [];
      for (const post of posts) {
        const { permalink, title } = post.metadata ?? {};
        if (permalink && title) {
          map.set(permalink, title);
        }
      }
    }
  }

  return map;
}
