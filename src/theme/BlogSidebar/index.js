import React from 'react';
import clsx from 'clsx';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useWindowSize, NavbarSecondaryMenuFiller } from '@docusaurus/theme-common';
import { useBlogSidebarPosts } from '@site/src/hooks/useBlogSidebarPosts';
import { stripLocalePrefix } from '@site/src/utils/locale';
import styles from './styles.module.css';

// Flat, newest-first post list (no folder/category grouping) — replaces the
// earlier collapsible-category tree per user request.
function PostList({ posts, currentPath }) {
  return (
    <ul className={styles.tree}>
      {posts.map(post => (
        <li key={post.id}>
          <a
            href={post.permalink}
            aria-current={post.permalink === currentPath ? 'page' : undefined}
            className={styles.pageLink}>
            <span className={styles.pageLinkLabel}>{post.title}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function BlogSidebarDesktop({ posts, currentPath }) {
  return (
    <aside className={clsx('col', 'col--3', styles.sidebarCol)}>
      <nav className={clsx(styles.sidebar, 'thin-scrollbar')} aria-label="Blog categories navigation">
        <PostList posts={posts} currentPath={currentPath} />
      </nav>
    </aside>
  );
}

function BlogSidebarMobileContent({ posts, currentPath }) {
  return (
    <div className={styles.mobileWrap}>
      <PostList posts={posts} currentPath={currentPath} />
    </div>
  );
}

function BlogSidebarMobile(props) {
  return <NavbarSecondaryMenuFiller component={BlogSidebarMobileContent} props={props} />;
}

export default function BlogSidebar() {
  const posts = useBlogSidebarPosts();
  const windowSize = useWindowSize();
  const location = useLocation();
  const {
    i18n: { currentLocale, defaultLocale },
  } = useDocusaurusContext();
  const currentPath = stripLocalePrefix(location.pathname, currentLocale, defaultLocale).replace(/\/$/, '') || '/';

  if (posts.length === 0) {
    return null;
  }
  if (windowSize === 'mobile') {
    return <BlogSidebarMobile posts={posts} currentPath={currentPath} />;
  }
  return <BlogSidebarDesktop posts={posts} currentPath={currentPath} />;
}
