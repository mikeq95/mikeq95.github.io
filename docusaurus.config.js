// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: ' Apple Intelligence',
  tagline: 'It\'s our world, we just live in it.',
  favicon: 'img/favicon.ico',
  deploymentBranch: 'gh-pages',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://mikeQ95.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'mikeQ95', // Usually your GitHub org/user name.
  projectName: 'mikeq95.github.io', // Usually your repo name.

  onBrokenLinks: 'throw',
  trailingSlash: false,

  customFields: {
    clerkPublishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
  },
  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: {
           blogSidebarCount: 'ALL',
            blogSidebarTitle: 'All posts',
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
            // 生成 RSS 和 Atom 订阅源，方便用户订阅博客更新
          },
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        // 自动生成 sitemap.xml，让搜索引擎收录你的页面
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
        // Google Analytics 统计，追踪访客数据
        gtag: {
          trackingID: 'G-2DYQKKG4V1',
          anonymizeIP: true, // 匿名化 IP 地址，保护用户隐私
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      metadata: [
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@' },
      ],
      colorMode: {
        disableSwitch: true,
      },
      navbar: {
        title: 'Clearlove7',
        items: [
          { to: '/blog', label: 'Blog', position: 'left' },
        ],
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;