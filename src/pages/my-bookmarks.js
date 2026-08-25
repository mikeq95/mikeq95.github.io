import React from 'react';
import CollectionPage from '@site/src/components/CollectionPage';

export default function MyBookmarksPage() {
  return (
    <CollectionPage
      table="bookmarks"
      emptyIcon="mdi:bookmark-off-outline"
      copy={{
        title: { en: 'My Bookmarks', zh: '我的收藏' },
        description: { en: 'Posts you bookmarked', zh: '你收藏过的文章' },
        pageTitle: { en: 'My Bookmarks 🔖', zh: '我的收藏 🔖' },
        loginPrompt: { en: 'Please log in to see your bookmarks.', zh: '请先登录查看你的收藏记录。' },
        emptyText: { en: 'No bookmarks yet.', zh: '还没有收藏任何文章。' },
      }}
    />
  );
}
