// @ts-check
import remarkFlexibleMarkers from 'remark-flexible-markers';
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'mikeQ95',
  tagline: '你好 こんにちは 안녕하세요 hello everyone 🌏',
  favicon: 'img/favicon.ico',
  future: {
    v4: true,
  },
  url: 'https://mikeq95.github.io',
  baseUrl: '/',
  organizationName: 'mikeQ95',
  projectName: 'mikeq95.github.io',
  deploymentBranch: 'main',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      ({
        docs: false,
        blog: {
          remarkPlugins: [remarkFlexibleMarkers],
          routeBasePath: '/',
          showReadingTime: true,
          blogSidebarTitle: '最近文章',
          blogSidebarCount: 10,
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],
  themeConfig: ({
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'mikeQ95',
      items: [
        {to: '/', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/mikeQ95',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} mikeQ95. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['swift', 'javascript'],
    },
  }),
};

export default config;