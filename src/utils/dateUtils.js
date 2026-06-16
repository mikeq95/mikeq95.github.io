export function timeAgo(dateStr, isEn) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return isEn ? 'just now' : '刚刚';
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return isEn ? `${m}m ago` : `${m}分钟前`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return isEn ? `${h}h ago` : `${h}小时前`;
  }
  const d = Math.floor(diff / 86400);
  return isEn ? `${d}d ago` : `${d}天前`;
}
