import React from 'react';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import BlogPostItemHeaderTitle from '@theme/BlogPostItem/Header/Title';
import BlogPostItemHeaderInfo from '@theme/BlogPostItem/Header/Info';
import BlogPostItemHeaderAuthors from '@theme/BlogPostItem/Header/Authors';
import styles from './styles.module.css';

// Ported from blume's own lead-paragraph pattern (`<h1>{title}</h1>{frontmatter.description
// && <p class="text-lg text-muted-foreground">{frontmatter.description}</p>}`
// in its `[...slug].astro`) — renders the post's frontmatter description as a
// larger, muted lead directly under the title. `BlogPostItem/Header` is shared
// with list-preview cards, so this is gated on `isBlogPostPage` to only show
// on the full post page.
export default function BlogPostItemHeader() {
  const { metadata, isBlogPostPage } = useBlogPost();
  return (
    <header>
      <BlogPostItemHeaderTitle />
      {isBlogPostPage && metadata.description && (
        <p className={styles.leadDescription}>{metadata.description}</p>
      )}
      <div className={styles.metaRow}>
        <BlogPostItemHeaderInfo />
      </div>
      <BlogPostItemHeaderAuthors />
    </header>
  );
}
