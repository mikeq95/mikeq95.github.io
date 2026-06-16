import { useState, useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';

const COOLDOWN_MS = 30 * 60 * 1000; // don't re-count same browser within 30 min

function getViewerKey(user) {
  if (user?.id) return `u:${user.id}`;
  let k = localStorage.getItem('_vk');
  if (!k) {
    k = crypto.randomUUID();
    localStorage.setItem('_vk', k);
  }
  return `a:${k}`;
}

function shouldRecord(postId) {
  const key = `_lv:${postId}`;
  const last = Number(localStorage.getItem(key) || 0);
  if (Date.now() - last < COOLDOWN_MS) return false;
  localStorage.setItem(key, String(Date.now()));
  return true;
}

export function usePostViews(postId) {
  const { user } = useAuth();
  const { siteConfig } = useDocusaurusContext();
  const adminIds = siteConfig.customFields?.adminUserIds ?? [];
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    if (!postId || !supabase) return;

    const viewerKey = getViewerKey(user);
    const isOwner = user?.id && adminIds.includes(user.id);

    // Record view (skip self, skip within cooldown window)
    if (!isOwner && shouldRecord(postId)) {
      supabase
        .from('post_views')
        .insert({ post_id: postId, viewer_key: viewerKey })
        .then(({ error }) => { if (error) console.error('view insert failed', error); });
    }

    // Fetch counts: use head:true for total (no row data), viewer_key for unique (bounded)
    Promise.all([
      supabase.from('post_views').select('*', { count: 'exact', head: true }).eq('post_id', postId),
      supabase.from('post_views').select('viewer_key').eq('post_id', postId).limit(10000),
    ]).then(([{ count: total }, { data }]) => {
      const unique = data ? new Set(data.map(r => r.viewer_key)).size : 0;
      setCounts({ total: total ?? 0, unique });
    });
  }, [postId, user?.id]);

  return counts;
}
