import React from 'react';
import clsx from 'clsx';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useWindowSize, NavbarSecondaryMenuFiller } from '@docusaurus/theme-common';
import { useBlogCategoryTree } from '@site/src/hooks/useBlogCategoryTree';
import { stripLocalePrefix } from '@site/src/utils/locale';
import { ChevronRightIcon } from '@site/src/components/BlumeIcons';
import styles from './styles.module.css';

// Ported from blume's `NavTree.astro` ("group" display mode + "page" leaf
// rendering — the only two node kinds this tree needs), translated from Astro
// markup to JSX. Structure, classes, and behavior (collapsible <details> per
// category, current-item highlighting) mirror the source directly; only the
// data source differs, since blume reads Astro content collections and this
// site has no equivalent — categories come from `useBlogCategoryTree`
// (grouped by the blog's own `blog/<Category>/` subfolders) instead.
function CategoryTree({ categories, currentPath }) {
  return (
    <ul className={styles.tree}>
      {categories.map((category, index) => {
        const active = category.posts.some(post => post.permalink === currentPath);
        return (
          <li key={category.id} className={index === 0 ? styles.itemFirst : styles.item}>
            <details open={active} className={styles.details}>
              <summary className={styles.summary}>
                <span className={styles.summaryLabel}>{category.label}</span>
                <span className={styles.chevron}>
                  <ChevronRightIcon size={13} />
                </span>
              </summary>
              <div className={styles.children}>
                <ul className={styles.tree}>
                  {category.posts.map(post => (
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
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}

function BlogSidebarDesktop({ categories, currentPath }) {
  return (
    <aside className={clsx('col', 'col--3', styles.sidebarCol)}>
      <nav className={clsx(styles.sidebar, 'thin-scrollbar')} aria-label="Blog categories navigation">
        <CategoryTree categories={categories} currentPath={currentPath} />
      </nav>
    </aside>
  );
}

function BlogSidebarMobileContent({ categories, currentPath }) {
  return (
    <div className={styles.mobileWrap}>
      <CategoryTree categories={categories} currentPath={currentPath} />
    </div>
  );
}

function BlogSidebarMobile(props) {
  return <NavbarSecondaryMenuFiller component={BlogSidebarMobileContent} props={props} />;
}

export default function BlogSidebar() {
  const categories = useBlogCategoryTree();
  const windowSize = useWindowSize();
  const location = useLocation();
  const {
    i18n: { currentLocale, defaultLocale },
  } = useDocusaurusContext();
  const currentPath = stripLocalePrefix(location.pathname, currentLocale, defaultLocale).replace(/\/$/, '') || '/';

  if (categories.length === 0) {
    return null;
  }
  if (windowSize === 'mobile') {
    return <BlogSidebarMobile categories={categories} currentPath={currentPath} />;
  }
  return <BlogSidebarDesktop categories={categories} currentPath={currentPath} />;
}
