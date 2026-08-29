import React from 'react';

// Lucide icon paths (24x24, stroke-based), matching the exact icons blume
// itself renders via its `Icon.astro` (backed by `@iconify-json/lucide`) for
// the nav tree and table-of-contents/page-actions components ported here.

const Svg = ({ size = 16, className, children }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true">
    {children}
  </svg>
);

export const ChevronRightIcon = props => (
  <Svg {...props}>
    <path d="m9 18l6-6l-6-6" />
  </Svg>
);

export const ChevronDownIcon = props => (
  <Svg {...props}>
    <path d="m6 9l6 6l6-6" />
  </Svg>
);

export const ArrowUpIcon = props => (
  <Svg {...props}>
    <path d="m5 12l7-7l7 7m-7 7V5" />
  </Svg>
);

export const CopyIcon = props => (
  <Svg {...props}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </Svg>
);

export const ExternalLinkIcon = props => (
  <Svg {...props}>
    <path d="M15 3h6v6m-11 5L21 3m-3 10v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </Svg>
);
