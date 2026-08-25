// Strips the current locale's URL prefix (e.g. "/en") from a pathname or
// permalink, returning the locale-independent path. Used to key
// likes/bookmarks/comments across locales, and as the base for building
// cross-locale links.
export function stripLocalePrefix(path, currentLocale, defaultLocale) {
  if (currentLocale === defaultLocale) return path;
  return path.replace(new RegExp(`^/${currentLocale}`), '') || '/';
}
