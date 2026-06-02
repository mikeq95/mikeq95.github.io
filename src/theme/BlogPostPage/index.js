import React from 'react';
import clsx from 'clsx';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {HtmlClassNameProvider, ThemeClassNames} from '@docusaurus/theme-common';
import {
  BlogPostProvider,
  useBlogPost,
} from '@docusaurus/plugin-content-blog/client';
import BlogLayout from '@theme/BlogLayout';
import BlogPostItem from '@theme/BlogPostItem';
import BlogPostPaginator from '@theme/BlogPostPaginator';
import BlogPostPageMetadata from '@theme/BlogPostPage/Metadata';
import BlogPostPageStructuredData from '@theme/BlogPostPage/StructuredData';
import TOC from '@theme/TOC';
import ContentVisibility from '@theme/ContentVisibility';
import WalineComment from '@site/src/components/WalineComment';
import ShareButtons from '@site/src/components/ShareButtons';
import PostActions from '@site/src/components/PostActions';
import ReadingProgress from '@site/src/components/ReadingProgress';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function BlogPostPageContent({sidebar, children}) {
  const {metadata, toc} = useBlogPost();
  const {nextItem, prevItem, frontMatter} = metadata;
  const {siteConfig} = useDocusaurusContext();
  const {
    hide_table_of_contents: hideTableOfContents,
    toc_min_heading_level: tocMinHeadingLevel,
    toc_max_heading_level: tocMaxHeadingLevel,
  } = frontMatter;

  const postUrl = `${siteConfig.url}${metadata.permalink}`;

  return (
    <>
      <BrowserOnly>{() => <ReadingProgress />}</BrowserOnly>
    <BlogLayout
      sidebar={sidebar}
      toc={
        !hideTableOfContents && toc.length > 0 ? (
          <TOC
            toc={toc}
            minHeadingLevel={tocMinHeadingLevel}
            maxHeadingLevel={tocMaxHeadingLevel}
          />
        ) : undefined
      }>
      <ContentVisibility metadata={metadata} />
      <BlogPostItem>{children}</BlogPostItem>
      <ShareButtons title={metadata.title} url={postUrl} />
      <PostActions postId={metadata.permalink} />
      {(nextItem || prevItem) && (
        <BlogPostPaginator nextItem={nextItem} prevItem={prevItem} />
      )}
      <WalineComment />
    </BlogLayout>
    </>
  );
}

export default function BlogPostPage(props) {
  const BlogPostContent = props.content;
  return (
    <BlogPostProvider content={props.content} isBlogPostPage>
      <HtmlClassNameProvider
        className={clsx(
          ThemeClassNames.wrapper.blogPages,
          ThemeClassNames.page.blogPostPage,
        )}>
        <BlogPostPageMetadata />
        <BlogPostPageStructuredData />
        <BlogPostPageContent sidebar={props.sidebar}>
          <BlogPostContent />
        </BlogPostPageContent>
      </HtmlClassNameProvider>
    </BlogPostProvider>
  );
}
