// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';
import { createRequire } from 'module';

// Load .env.local for local dev (Docusaurus doesn't load this automatically)
const _require = createRequire(import.meta.url);
_require('dotenv').config({ path: '.env.local' });

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'mikeq95\'s blog',
  tagline: 'It\'s our world, we just live in it.',
  favicon: 'img/favicon.ico',
  deploymentBranch: 'gh-pages',
  customFields: {
    // comma-separated list of admin Supabase user UUIDs
    adminUserIds: (process.env.DOCUSAURUS_ADMIN_USER_ID ?? '').split(',').filter(Boolean),
  },

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://mikeq95blog.uk',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'mikeQ95', // Usually your GitHub org/user name.
  projectName: 'mikeq95.github.io', // Usually your repo name.

  onBrokenLinks: 'throw',
  trailingSlash: false,

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans', 'en'],
    localeConfigs: {
      'zh-Hans': { label: '简体中文', htmlLang: 'zh-Hans' },
      en: { label: 'English', htmlLang: 'en' },
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'docs',
          routeBasePath: 'docs',
        },
        blog: {
          blogSidebarCount: 20,
          blogSidebarTitle: 'All posts',
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
            // 生成 RSS 和 Atom 订阅源，方便用户订阅博客更新
          },
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
        ...(process.env.NODE_ENV === 'production' ? {
          gtag: {
            trackingID: 'G-2DYQKKG4V1',
            anonymizeIP: true,
          },
        } : {}),
      }),
    ],
  ],

  plugins: [
    require.resolve('./src/plugins/blogGlobalDataPlugin'),
    require.resolve('./plugins/posts-meta-plugin'),
  ],

  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        language: ["en", "zh"],
        indexDocs: false,
        indexBlog: true,
        indexPages: true,
        docsRouteBasePath: [],
        searchBarShortcutHint: false,
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/og-card.png',
      metadata: [
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      colorMode: {
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        logo: {
          alt: 'pixel logo',
          src: 'img/pixel-logo.png',
          style: { height: '42px', width: '42px', objectFit: 'contain', imageRendering: 'pixelated' },
        },
        title: "mikeq95's blog",
        items: [
          { type: 'custom-NavbarLanguageSwitcher', position: 'right' },
        ],
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;