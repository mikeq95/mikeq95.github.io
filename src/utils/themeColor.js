export function applyAccentColor(color) {
  let styleEl = document.getElementById('custom-theme-color-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'custom-theme-color-style';
    document.head.appendChild(styleEl);
  }
  styleEl.innerHTML = `
    :root {
      --ifm-color-primary: ${color} !important;
      --ifm-color-primary-dark: ${color} !important;
      --ifm-color-primary-darker: ${color} !important;
      --ifm-color-primary-darkest: ${color} !important;
      --ifm-color-primary-light: ${color} !important;
      --ifm-color-primary-lighter: ${color} !important;
      --ifm-color-primary-lightest: ${color} !important;
      --ifm-link-color: ${color} !important;
    }
    ::selection { background-color: ${color} !important; color: #fff !important; }
    ::-moz-selection { background-color: ${color} !important; color: #fff !important; }
  `;
}
