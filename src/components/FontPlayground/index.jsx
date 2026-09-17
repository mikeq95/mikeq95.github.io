import React, { useEffect, useId, useRef, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Icon } from '@iconify/react';
import {
  Popover,
  PopoverButton,
  PopoverPanel,
} from '@/components/animate-ui/components/headless/popover';
import styles from './styles.module.css';

/**
 * FontPlayground — interactive font-preview card for blog posts.
 * Editable sample text + live weight/size controls + a Static/Variable
 * weight-picker menu + a "copy the current CSS" button.
 *
 * How to swap fonts later:
 *
 * 1. Google Fonts (variable font — this is what the Outfit article uses):
 *      <FontPlayground
 *        family="Outfit"
 *        cssHref="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap"
 *      />
 *
 * 2. Fontshare (same "link a stylesheet" shape):
 *      <FontPlayground
 *        family="Clash Display"
 *        cssHref="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,700&display=swap"
 *      />
 *
 * 3. Self-hosted, open-source font with no CDN — put the .woff2 under
 *    static/fonts/ and pass e.g. src="/fonts/my-font.woff2". NOT wired up
 *    yet (this prop is currently accepted but unused — Outfit uses cssHref).
 *    A future implementer adding this should, in a useEffect keyed on `src`
 *    and deduped the same way the cssHref <link> is deduped below (but
 *    injecting a <style> tag instead of a <link>), add:
 *      @font-face {
 *        font-family: "<family>";
 *        src: url("<src>") format("woff2");
 *        font-display: swap;
 *      }
 *    Never commit a closed-source/licensed font file — those must load from
 *    the vendor's own CDN via cssHref instead.
 *
 * 4. Custom named weights instead of the default Thin..Black scale: pass
 *    styles={[{ label: 'Text', weight: 450 }, { label: 'Display', weight: 700 }]}.
 */

const DEFAULT_WEIGHT_STYLES = [
  { label: 'Thin', weight: 100 },
  { label: 'Extra Light', weight: 200 },
  { label: 'Light', weight: 300 },
  { label: 'Regular', weight: 400 },
  { label: 'Medium', weight: 500 },
  { label: 'SemiBold', weight: 600 },
  { label: 'Bold', weight: 700 },
  { label: 'Extra Bold', weight: 800 },
  { label: 'Black', weight: 900 },
];

// Popover/PopoverButton/PopoverPanel (Headless UI under the hood) isn't
// SSR-safe — every existing consumer in this repo (NavbarSettingsButton,
// NavbarLanguageSwitcher, AuthButtons, ActionBar) gates it behind
// useIsBrowser()/BrowserOnly. Isolated in its own component here so the
// rest of the card (sample text, sliders, number inputs, copy button) keeps
// rendering via SSR/build exactly as before — only this menu is
// client-only, with a plain-badge fallback shown until hydration.
function ModeMenu({
  modeButtonLabel,
  weightStyles,
  mode,
  staticWeight,
  weight,
  variable,
  onSelectStatic,
  onSelectVariable,
}) {
  const hasStaticGroup = weightStyles.length > 0;
  return (
    <Popover className={styles.modeMenu}>
      <PopoverButton as="button" type="button" className={styles.badge}>
        {modeButtonLabel}
      </PopoverButton>
      <PopoverPanel
        anchor={{ to: 'bottom end', gap: 6 }}
        className="w-auto rounded-none border-0 bg-transparent p-0 shadow-none"
      >
        <ul className={styles.menu} role="listbox">
          {hasStaticGroup && (
            <li className={styles.menuGroupLabel} role="presentation">Static</li>
          )}
          {hasStaticGroup && weightStyles.map((s) => {
            const isChecked = mode === 'static' && staticWeight === s.weight;
            const showEquals = mode === 'variable' && weight === s.weight;
            return (
              <li key={s.weight} role="option" aria-selected={isChecked}>
                <PopoverButton
                  as="button"
                  type="button"
                  className={styles.menuItem}
                  onClick={() => onSelectStatic(s.weight)}
                >
                  <span className={styles.menuItemCheck}>
                    {isChecked && <Icon icon="mdi:check" width={16} height={16} />}
                  </span>
                  <span>{s.label}</span>
                  {showEquals && <span className={styles.menuItemHint}>= {s.weight}</span>}
                </PopoverButton>
              </li>
            );
          })}
          {hasStaticGroup && variable && <li className={styles.menuDivider} role="presentation" />}
          {variable && (
            <li role="option" aria-selected={mode === 'variable'}>
              <PopoverButton as="button" type="button" className={styles.menuItem} onClick={onSelectVariable}>
                <span className={styles.menuItemCheck}>
                  {mode === 'variable' && <Icon icon="mdi:check" width={16} height={16} />}
                </span>
                <span>Variable</span>
              </PopoverButton>
            </li>
          )}
        </ul>
      </PopoverPanel>
    </Popover>
  );
}

export default function FontPlayground({
  family,
  cssHref,
  // eslint-disable-next-line no-unused-vars -- reserved extension point, see file-header comment (case 3)
  src,
  weightMin = 100,
  weightMax = 900,
  defaultWeight = 400,
  defaultSize = 72,
  minSize = 16,
  maxSize = 160,
  sampleText = 'The quick brown fox',
  variable = true,
  styles: weightStylesProp,
  credit,
}) {
  const [mode, setMode] = useState(variable ? 'variable' : 'static');
  const [staticWeight, setStaticWeight] = useState(defaultWeight);
  const [weight, setWeight] = useState(defaultWeight);
  const [size, setSize] = useState(defaultSize);
  const [weightText, setWeightText] = useState(String(defaultWeight));
  const [sizeText, setSizeText] = useState(String(defaultSize));
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef(null);
  const weightInputId = useId();
  const sizeInputId = useId();

  const weightStyles = (weightStylesProp ?? DEFAULT_WEIGHT_STYLES).filter(
    (s) => s.weight >= weightMin && s.weight <= weightMax
  );

  // Load the webfont's stylesheet once, deduped by exact href value (not a
  // fixed element id) — different articles need different hrefs, and this
  // mirrors src/utils/themeColor.js's "check before inserting" idiom.
  useEffect(() => {
    if (!cssHref) return;
    const alreadyLoaded = Array.from(
      document.head.getElementsByTagName('link')
    ).some((link) => link.getAttribute('href') === cssHref);
    if (alreadyLoaded) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssHref;
    document.head.appendChild(link);
  }, [cssHref]);

  useEffect(() => () => clearTimeout(copiedTimerRef.current), []);

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const handleWeightSlider = (e) => {
    const v = Number(e.target.value);
    setWeight(v);
    setWeightText(String(v));
  };

  const handleWeightText = (e) => {
    const raw = e.target.value;
    setWeightText(raw);
    const parsed = Number(raw);
    if (raw.trim() !== '' && Number.isFinite(parsed)) {
      setWeight(parsed);
    }
  };

  const commitWeightText = () => {
    const parsed = Number(weightText);
    const finalValue = weightText.trim() === '' || !Number.isFinite(parsed)
      ? weight
      : clamp(Math.round(parsed), weightMin, weightMax);
    setWeight(finalValue);
    setWeightText(String(finalValue));
  };

  const handleWeightKeyDown = (e) => {
    if (e.key === 'Enter') {
      commitWeightText();
      e.currentTarget.blur();
    }
  };

  const handleSizeSlider = (e) => {
    const v = Number(e.target.value);
    setSize(v);
    setSizeText(String(v));
  };

  const handleSizeText = (e) => {
    const raw = e.target.value;
    setSizeText(raw);
    const parsed = Number(raw);
    if (raw.trim() !== '' && Number.isFinite(parsed)) {
      setSize(parsed);
    }
  };

  const commitSizeText = () => {
    const parsed = Number(sizeText);
    const finalValue = sizeText.trim() === '' || !Number.isFinite(parsed)
      ? size
      : clamp(Math.round(parsed), minSize, maxSize);
    setSize(finalValue);
    setSizeText(String(finalValue));
  };

  const handleSizeKeyDown = (e) => {
    if (e.key === 'Enter') {
      commitSizeText();
      e.currentTarget.blur();
    }
  };

  const selectStaticWeight = (w) => {
    setStaticWeight(w);
    setMode('static');
  };

  const selectVariable = () => {
    setMode('variable');
  };

  const displayWeight = mode === 'variable' ? weight : staticWeight;
  const currentStaticStyle = weightStyles.find((s) => s.weight === staticWeight);
  const modeButtonLabel = mode === 'variable' ? 'Variable' : (currentStaticStyle?.label ?? 'Static');

  const handleCopyCss = async () => {
    const css = `font-family: "${family}", sans-serif;\nfont-weight: ${displayWeight};\nfont-size: ${size}px;`;
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[FontPlayground] Copy CSS failed', err);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.family}>{family}</span>
        <BrowserOnly fallback={<span className={styles.badge}>{modeButtonLabel}</span>}>
          {() => (
            <ModeMenu
              modeButtonLabel={modeButtonLabel}
              weightStyles={weightStyles}
              mode={mode}
              staticWeight={staticWeight}
              weight={weight}
              variable={variable}
              onSelectStatic={selectStaticWeight}
              onSelectVariable={selectVariable}
            />
          )}
        </BrowserOnly>
      </div>

      {/* Uncontrolled on purpose: sampleText never changes after mount, so
          React bails out of touching this node's text on later re-renders
          (slider drags, mode switches), leaving the user's in-place edits
          and cursor position alone. Do not lift this into controlled state. */}
      <div
        className={styles.sample}
        contentEditable
        suppressContentEditableWarning
        style={{
          fontFamily: `"${family}", sans-serif`,
          fontWeight: displayWeight,
          fontSize: `${size}px`,
        }}
      >
        {sampleText}
      </div>

      <div className={styles.controls}>
        <div className={styles.controlRow}>
          <label className={styles.controlLabel} htmlFor={weightInputId}>Weight</label>
          <input
            id={weightInputId}
            type="range"
            className={styles.slider}
            min={weightMin}
            max={weightMax}
            value={displayWeight}
            disabled={mode !== 'variable'}
            onChange={handleWeightSlider}
          />
          <div className={styles.valueControl}>
            <input
              type="number"
              className={styles.numberInput}
              aria-label="Weight"
              min={weightMin}
              max={weightMax}
              step={1}
              disabled={mode !== 'variable'}
              value={mode === 'variable' ? weightText : staticWeight}
              onChange={handleWeightText}
              onBlur={commitWeightText}
              onKeyDown={handleWeightKeyDown}
            />
          </div>
        </div>

        <div className={styles.controlRow}>
          <label className={styles.controlLabel} htmlFor={sizeInputId}>Size</label>
          <input
            id={sizeInputId}
            type="range"
            className={styles.slider}
            min={minSize}
            max={maxSize}
            value={size}
            onChange={handleSizeSlider}
          />
          <div className={styles.valueControl}>
            <input
              type="number"
              className={styles.numberInput}
              aria-label="Size"
              min={minSize}
              max={maxSize}
              step={1}
              value={sizeText}
              onChange={handleSizeText}
              onBlur={commitSizeText}
              onKeyDown={handleSizeKeyDown}
            />
            <span className={styles.unit}>px</span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.copyButton} onClick={handleCopyCss}>
          复制 CSS
        </button>
        {copied && <span className={styles.copiedFlash}>已复制</span>}
      </div>

      {credit && <div className={styles.credit}>{credit}</div>}
    </div>
  );
}
