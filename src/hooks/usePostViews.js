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
  const adminId = siteConfig.customFields?.adminUserId ?? '';
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    if (!postId || !supabase) return;

    const viewerKey = getViewerKey(user);
    const isOwner = !!adminId && user?.id === adminId;

    // Record view (skip self, skip within cooldown window)
    if (!isOwner && shouldRecord(postId)) {
      supabase
        .from('post_views')
        .insert({ post_id: postId, viewer_key: viewerKey })
        .then();
    }

    // Fetch counts
    supabase
      .from('post_views')
      .select('viewer_key')
      .eq('post_id', postId)
      .then(({ data }) => {
        if (!data) return;
        const total = data.length;
        const unique = new Set(data.map(r => r.viewer_key)).size;
        setCounts({ total, unique });
      });
  }, [postId, user?.id]);

  return counts;
}
