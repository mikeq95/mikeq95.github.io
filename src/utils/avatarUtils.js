const AVATAR_COLORS = [
  '#f97316', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#3b82f6', '#ec4899',
];

export function hashAvatarColor(str) {
  let h = 0;
  for (let i = 0; i < (str?.length ?? 0); i++) {
    h = str.charCodeAt(i) + ((h << 5) - h);
  }
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
