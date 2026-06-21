import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import {
  useThemeConfig,
  ErrorCauseBoundary,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import {
  splitNavbarItems,
  useNavbarMobileSidebar,
} from '@docusaurus/theme-common/internal';
import NavbarItem from '@theme/NavbarItem';
import SearchBar from '@theme/SearchBar';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import NavbarLogo from '@theme/Navbar/Logo';
import NavbarSearch from '@theme/Navbar/Search';
import AuthButtons from '@site/src/components/AuthButtons';
import GlassSurface from '@site/src/components/GlassSurface';

import styles from './styles.module.css';

// Half of the navbar's own rendered height, so the pill's ends are always a true
// semicircle — measured directly off the DOM instead of duplicating the height
// values from custom.css's `.navbar` rule (64px desktop / 56px mobile), which
// would silently drift out of sync if either one changes.
function useNavbarBorderRadius() {
  const [borderRadius, setBorderRadius] = useState(32);

  useEffect(() => {
    const navEl = document.querySelector('.navbar');
    if (!navEl) return undefined;

    const update = () => setBorderRadius(navEl.getBoundingClientRect().height / 2);
    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(navEl);
    return () => resizeObserver.disconnect();
  }, []);

  return borderRadius;
}

function useNavbarItems() {
  return useThemeConfig().navbar.items;
}

function NavbarItems({ items }) {
  return (
    <>
      {items.map((item, i) => (
        <ErrorCauseBoundary
          key={i}
          onError={(error) =>
            new Error(
              `A theme navbar item failed to render.
Please double-check the following navbar item (themeConfig.navbar.items) of your Docusaurus config:
${JSON.stringify(item, null, 2)}`,
              { cause: error },
            )
          }>
          <NavbarItem {...item} />
        </ErrorCauseBoundary>
      ))}
    </>
  );
}

function NavbarContentLayout({ left, right }) {
  return (
    <div className="navbar__inner">
      <div
        className={clsx(
          ThemeClassNames.layout.navbar.containerLeft,
          'navbar__items',
        )}>
        {left}
      </div>
      <div
        className={clsx(
          ThemeClassNames.layout.navbar.containerRight,
          'navbar__items navbar__items--right',
        )}>
        {right}
      </div>
    </div>
  );
}

export default function NavbarContent() {
  const mobileSidebar = useNavbarMobileSidebar();
  const items = useNavbarItems();
  const [leftItems, rightItems] = splitNavbarItems(items);
  const searchBarItem = items.find((item) => item.type === 'search');
  const borderRadius = useNavbarBorderRadius();

  return (
    <GlassSurface
      width="100%"
      height="100%"
      borderRadius={borderRadius}
      className={styles.glassNav}
    >
      <NavbarContentLayout
        left={
          <>
            {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
            <NavbarLogo />
            <NavbarItems items={leftItems} />
          </>
        }
        right={
          <>
            {!searchBarItem && (
              <NavbarSearch>
                <SearchBar />
              </NavbarSearch>
            )}
            <NavbarItems items={rightItems} />
            <div className={styles.authItem}>
              <AuthButtons />
            </div>
          </>
        }
      />
    </GlassSurface>
  );
}
