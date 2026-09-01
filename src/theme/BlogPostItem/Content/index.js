import React from 'react';
import clsx from 'clsx';
import {blogPostContainerID} from '@docusaurus/utils-common';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import MDXContent from '@theme/MDXContent';

// On the list/archive page, use frontmatter `description` as the excerpt
// instead of the MDX content before `{/* truncate */}` — avoids the excerpt
// duplicating the lead paragraph shown by `@theme/BlogPostItem/Header`.
export default function BlogPostItemContent({children, className}) {
  const {metadata, isBlogPostPage} = useBlogPost();
  const useDescriptionAsExcerpt = !isBlogPostPage && metadata.description;
  return (
    <div
      // This ID is used for the feed generation to locate the main content
      id={isBlogPostPage ? blogPostContainerID : undefined}
      className={clsx('markdown', className)}>
      {useDescriptionAsExcerpt ? (
        <p>{metadata.description}</p>
      ) : (
        <MDXContent>{children}</MDXContent>
      )}
    </div>
  );
}
