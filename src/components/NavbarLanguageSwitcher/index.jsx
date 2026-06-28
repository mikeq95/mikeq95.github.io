import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';
import useIsBrowser from '@docusaurus/useIsBrowser';
import GlassSurface from '@site/src/components/GlassSurface';
import {
  Popover,
  PopoverButton,
  PopoverPanel,
} from '@/components/animate-ui/components/headless/popover';
import styles from './index.module.css';

function GlobeIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function getLocalePath(targetLocale, defaultLocale, currentLocale, pathname) {
  const basePath =
    currentLocale === defaultLocale
      ? pathname
      : pathname.replace(new RegExp(`^/${currentLocale}`), '') || '/';

  if (targetLocale === defaultLocale) return basePath || '/';
  return `/${targetLocale}${basePath === '/' ? '' : basePath}`;
}

function LanguageSwitcherButton() {
  const { i18n: { currentLocale, defaultLocale, locales, localeConfigs } } = useDocusaurusContext();
  const { pathname } = useLocation();
  const label = localeConfigs[currentLocale]?.label ?? currentLocale;

  return (
    <Popover className={styles.wrapper}>
      {({ open }) => (
        <>
          <PopoverButton
            className={styles.pill}
            aria-label={`Switch language, current: ${label}`}
          >
            <GlobeIcon />
            <span className={styles.label}>{label}</span>
            <span className={styles.chevron}>
              <ChevronIcon open={open} />
            </span>
          </PopoverButton>

          <PopoverPanel
            anchor={{ to: 'bottom end', gap: 6 }}
            className="w-auto rounded-none border-0 bg-transparent p-0 shadow-none"
          >
            <GlassSurface
              className={styles.dropdown}
              width="auto"
              height="auto"
              borderRadius={10}
            >
              <ul className={styles.dropdownList} role="listbox">
                {locales.map(locale => {
                  const localeLabel = localeConfigs[locale]?.label ?? locale;
                  const href = getLocalePath(locale, defaultLocale, currentLocale, pathname);
                  const isCurrent = locale === currentLocale;
                  return (
                    <li key={locale} role="option" aria-selected={isCurrent}>
                      <a
                        href={href}
                        rel={isCurrent ? undefined : 'prefetch'}
                        className={`${styles.option} ${isCurrent ? styles.optionActive : ''}`}
                      >
                        {localeLabel}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </GlassSurface>
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
}

export default function NavbarLanguageSwitcher() {
  const isBrowser = useIsBrowser();
  if (!isBrowser) return null;
  return <LanguageSwitcherButton />;
}
