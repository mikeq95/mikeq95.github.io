import { useEffect, useState } from 'react';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';

// Fetches the current user's saved posts from `table` ('likes' or
// 'bookmarks') — both tables share the same {post_id, created_at} shape.
export function useUserCollection(table) {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!user || !supabase) return;
    setFetching(true);
    supabase
      .from(table)
      .select('post_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(`Failed to load ${table}:`, error);
        setPosts(data ?? []);
        setFetching(false);
      });
  }, [user, table]);

  return { user, loading, posts, fetching };
}
