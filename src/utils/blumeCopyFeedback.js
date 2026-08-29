// Ported from blume's `copy-feedback.ts`: shared clipboard + "Copied" flash
// used by the ported PageActions "Copy as Markdown" button.

const HOLD_MS = 1500;

let region = null;

export function announceCopied(message) {
  if (!region || !region.isConnected) {
    region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.className = 'sr-only';
    document.body.append(region);
  }
  region.textContent = '';
  region.textContent = message;
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function flashLabel(el, message, holdMs = HOLD_MS) {
  if (!el) return;
  if (el.dataset.blumeLabel === undefined) {
    el.dataset.blumeLabel = el.textContent ?? '';
  }
  el.textContent = message;
  announceCopied(message);
  clearTimeout(el._blumeLabelTimer);
  el._blumeLabelTimer = setTimeout(() => {
    el.textContent = el.dataset.blumeLabel ?? '';
  }, holdMs);
}
