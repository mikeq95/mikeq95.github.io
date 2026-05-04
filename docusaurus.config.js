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
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },
  presets: [
    [
      'classic',
      ({
        docs: false,
        blog: {
          remarkPlugins: [remarkFlexibleMarkers],
          routeBasePath: '/blog',
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
    image: 'img/social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'mikeQ95',
      items: [
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'mailto:malaxiangguo13579@icloud.com',
          position: 'right',
          className: 'header-email-link',
          'aria-label': 'Email me',
          html: '<span class="nav-tooltip">发邮件给我</span>',
        },
        {
          href: 'sms:giffgaffuk78459@icloud.com',
          position: 'right',
          className: 'header-imessage-link',
          'aria-label': 'iMessage me',
          html: '<span class="nav-tooltip">通过 iMessage 联系我</span>',
        },
        {
          href: 'https://github.com/mikeQ95',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
          html: '<span class="nav-tooltip">访问我的 GitHub</span>',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `💡 Think independently and distinguish right from wrong. ⚖️<br/>Copyright © ${new Date().getFullYear()} mikeQ95. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['swift', 'javascript'],
    },
  }),
};

export default config;