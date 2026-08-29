import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { stripLocalePrefix } from '@site/src/utils/locale';
import { ArrowUpIcon, CopyIcon, ExternalLinkIcon, ChevronDownIcon } from '@site/src/components/BlumeIcons';
import {
  ChatProviderLogos,
  CHAT_PROVIDERS,
  CHAT_PROVIDER_NAMES,
  CHAT_URL_BUILDERS,
} from '@site/src/components/ChatProviderLogos';
import { copyText, flashLabel } from '@site/src/utils/blumeCopyFeedback';
import styles from './styles.module.css';

// The trigger line for scrollspy, matching blume's sticky-header offset.
const TRIGGER_OFFSET = 72;

// Ported from blume's `toc-element.ts` (`<blume-toc>` custom element):
// IntersectionObserver as the cheap primary trigger, plus a passive
// rAF-throttled scroll listener for the one case it can't cover (a final
// section too short to push its heading past the trigger line).
function useTocScrollspy(listRef, deps) {
  useEffect(() => {
    const container = listRef.current;
    if (!container) return undefined;

    const entries = [];
    for (const link of container.querySelectorAll('a[href^="#"]')) {
      const id = decodeURIComponent(link.hash.slice(1));
      const heading = id ? document.getElementById(id) : null;
      if (heading) entries.push({ heading, link });
    }
    if (entries.length === 0) return undefined;

    let current = null;
    const activeLink = () => {
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (scrolledToBottom) return entries[entries.length - 1]?.link ?? null;
      let active = entries[0]?.link ?? null;
      for (const { heading, link } of entries) {
        if (heading.getBoundingClientRect().top <= TRIGGER_OFFSET) active = link;
      }
      return active;
    };
    const update = () => {
      const active = activeLink();
      if (active === current) return;
      current?.removeAttribute('aria-current');
      active?.setAttribute('aria-current', 'location');
      current = active;
    };

    const observer = new IntersectionObserver(update, {
      rootMargin: `-${TRIGGER_OFFSET}px 0px -70% 0px`,
      threshold: 0,
    });
    for (const { heading } of entries) observer.observe(heading);

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// Ported from blume's `PageActions.astro` inline script: native <details>
// dropdowns behaving like a proper menu (only one open at a time, flips above
// the trigger when opening downward would overflow the viewport).
function useActionMenus(actionsRef, deps) {
  useEffect(() => {
    const root = actionsRef.current;
    if (!root) return undefined;
    const dropdowns = [...root.querySelectorAll('details')];

    const placeMenu = details => {
      const menu = details.querySelector('[data-blume-menu]');
      const summary = details.querySelector('summary');
      if (!menu || !summary) return;
      const rect = summary.getBoundingClientRect();
      const margin = 8;
      const flipUp =
        rect.bottom + menu.offsetHeight + margin > window.innerHeight &&
        rect.top - menu.offsetHeight - margin > 0;
      menu.classList.toggle(styles.menuFlipUp, flipUp);
    };

    const cleanups = dropdowns.map(details => {
      const onToggle = () => {
        if (!details.open) return;
        for (const other of dropdowns) {
          if (other !== details) other.open = false;
        }
        placeMenu(details);
      };
      details.addEventListener('toggle', onToggle);
      return () => details.removeEventListener('toggle', onToggle);
    });
    return () => cleanups.forEach(cleanup => cleanup());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Direct port of blume's `TableOfContents.astro` (desktop variant) +
 * `PageActions.astro`: the heading list plus the scroll-to-top /
 * copy-as-markdown / open-in-chat actions, same markup, classes and
 * client behavior. Only the data layer differs — Docusaurus's `useBlogPost()`
 * stands in for the Astro content-collection query blume itself uses, and the
 * raw-markdown endpoint comes from this site's `docusaurus-plugin-llms`
 * output instead of blume's own generated `.md` route.
 */
export default function BlumeTableOfContents({ toc, minHeadingLevel = 2, maxHeadingLevel = 3 }) {
  const { metadata } = useBlogPost();
  const {
    siteConfig,
    i18n: { currentLocale, defaultLocale },
  } = useDocusaurusContext();
  const listRef = useRef(null);
  const actionsRef = useRef(null);
  const copyLabelRef = useRef(null);
  const [copyLabel, setCopyLabel] = useState('Copy as Markdown');

  const headings = (toc ?? []).filter(
    h => h.level >= minHeadingLevel && h.level <= maxHeadingLevel,
  );

  useTocScrollspy(listRef, [headings]);
  useActionMenus(actionsRef, [headings]);

  // docusaurus-plugin-llms emits per-page markdown at the locale-prefixed
  // permalink's path minus the `/blog` segment (verified against the real
  // build/ output for both the default locale and `en`). This only matches
  // posts whose frontmatter `slug` is a nested path (e.g. `2026/08/21/...`,
  // the vast majority of this blog's posts) — a handful of legacy posts with
  // a flat `slug` (no `/`) get a plugin-generated .md file at their *source
  // file's* folder instead of their real permalink, which this formula can't
  // reconstruct; those few will 404 on copy/open-in-chat (see plan risk notes).
  const logicalPermalink = stripLocalePrefix(metadata.permalink, currentLocale, defaultLocale);
  const localePrefix = currentLocale === defaultLocale ? '' : `/${currentLocale}`;
  const mdPath = `${localePrefix}${logicalPermalink.replace(/^\/blog/, '')}.md`;
  const mdUrl = `${siteConfig.url}${mdPath}`;
  const chatQuery = encodeURIComponent(
    `Read ${mdUrl} so I can ask you questions about this page.`,
  );

  const handleScrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleCopyMarkdown = async () => {
    try {
      const response = await fetch(mdPath);
      if (!response.ok) {
        throw new Error(`Fetching ${mdPath} failed (${response.status})`);
      }
      // docusaurus-plugin-llms doesn't strip MDX-only comments (e.g. the
      // blog's `{/* truncate */}` excerpt marker) from its generated output
      // — the live rendered page is clean (MDX strips it there), but this
      // raw fetch isn't, so it needs its own cleanup before being copied.
      const text = (await response.text()).replace(/\{\/\*[\s\S]*?\*\/\}\n?/g, '');
      if (await copyText(text)) {
        setCopyLabel('Copied!');
        flashLabel(copyLabelRef.current, 'Copied!');
        setTimeout(() => setCopyLabel('Copy as Markdown'), 1500);
      }
    } catch (error) {
      // Clipboard or fetch unavailable; don't flash "Copied!" untruthfully.
      console.error('[blume] Copy as Markdown failed', error);
    }
  };

  return (
    <div className={styles.tocWrap}>
      {headings.length > 0 && (
        <>
          <p className={styles.tocTitle}>On this page</p>
          <div ref={listRef} className={styles.tocList}>
            <ul className={styles.tocUl}>
              {headings.map(heading => (
                <li
                  key={heading.id}
                  style={{ paddingInlineStart: `${(heading.level - minHeadingLevel) * 0.75}rem` }}>
                  <a
                    href={`#${heading.id}`}
                    className={styles.tocLink}
                    dangerouslySetInnerHTML={{ __html: heading.value }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div ref={actionsRef} className={styles.actions}>
        <button type="button" className={styles.actionRow} onClick={handleScrollTop}>
          <ArrowUpIcon size={16} />
          Scroll to top
        </button>

        <button type="button" className={styles.actionRow} onClick={handleCopyMarkdown}>
          <CopyIcon size={16} />
          <span ref={copyLabelRef}>{copyLabel}</span>
        </button>

        <details className={styles.menuDetails}>
          <summary className={clsx(styles.actionRow, styles.menuSummary)}>
            <ExternalLinkIcon size={16} />
            Open in chat
            <span className={styles.menuChevron}>
              <ChevronDownIcon size={14} />
            </span>
          </summary>
          <div data-blume-menu className={styles.menu}>
            {CHAT_PROVIDERS.map((key, index) => (
              <React.Fragment key={key}>
                {index === 1 && CHAT_PROVIDERS[0] === 'v0' && <hr className={styles.menuSep} />}
                <a
                  className={styles.menuRow}
                  href={CHAT_URL_BUILDERS[key](chatQuery)}
                  target="_blank"
                  rel="noreferrer">
                  {ChatProviderLogos[key]}
                  <span className={styles.menuRowLabel}>Open in {CHAT_PROVIDER_NAMES[key]}</span>
                  <ExternalLinkIcon size={13} />
                </a>
              </React.Fragment>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
