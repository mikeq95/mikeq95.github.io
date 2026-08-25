import React from 'react';
import CollectionPage from '@site/src/components/CollectionPage';

export default function MyLikesPage() {
  return (
    <CollectionPage
      table="likes"
      emptyIcon="mdi:heart-off-outline"
      copy={{
        title: { en: 'My Likes', zh: '我的点赞' },
        description: { en: 'Posts you liked', zh: '你点赞过的文章' },
        pageTitle: { en: 'My Likes ❤️', zh: '我的点赞 ❤️' },
        loginPrompt: { en: 'Please log in to see your liked posts.', zh: '请先登录查看你的点赞记录。' },
        emptyText: { en: 'No liked posts yet.', zh: '还没有点赞任何文章。' },
      }}
    />
  );
}
