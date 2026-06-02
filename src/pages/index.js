import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useAllPluginInstancesData } from '@docusaurus/useGlobalData';
import Layout from '@theme/Layout';

import Heading from '@theme/Heading';
import RecentPosts from '@site/src/components/RecentPosts';
import styles from './index.module.css';

function HomepageHeader() {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isZh = currentLocale.startsWith('zh');
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroContainer}>
        <div className={styles.heroText}>
          <Heading as="h1" className={styles.title}>
            你好, <span className={styles.gradientText}>こんにちは, 안녕하세요, Hello</span>
          </Heading>
          <p className={styles.description}>
            {isZh
              ? '我是一名来自中国的大学生，欢迎来到我的博客。'
              : 'I am a university student from China. Welcome to my blog.'}
          </p>
          <div className={styles.buttons}>
            <Link className={styles.blogButton} to="/blog">
              {isZh ? '阅读我的博客' : 'Read my blog'}
            </Link>
          </div>
        </div>
        <div className={styles.heroImageContainer}>
          <img
            src={useBaseUrl('/img/ahri.jpg')}
            alt="Profile Avatar"
            className={styles.heroImage}
          />
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig, i18n: { currentLocale } } = useDocusaurusContext();
  const isZh = currentLocale.startsWith('zh');
  const allBlogData = useAllPluginInstancesData('docusaurus-plugin-content-blog');
  const recentPosts = (allBlogData?.default?.posts ?? []).slice(0, 5);

  return (
    <Layout
      title={isZh ? `欢迎来到 ${siteConfig.title}` : `Welcome to ${siteConfig.title}`}
      description="mijeq95's personal blog - A university student from China sharing thoughts, UI designs, and coding experiences.">
      <HomepageHeader />
      <main>
        <RecentPosts posts={recentPosts} />
      </main>
    </Layout>
  );
}
