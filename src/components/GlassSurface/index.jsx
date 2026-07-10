import './GlassSurface.css';

// Renders a plain blurred glass surface everywhere. This used to branch into an
// SVG chromatic-displacement ("liquid glass") effect on Chromium, but that path
// visibly distorted foreground text/icons and scrolled-under content, and Safari/
// Firefox never used it anyway — so the fallback is now the only style, keeping
// the effect consistent across browsers.
const GlassSurface = ({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  className = '',
  style = {},
  solid = false
}) => {
  const containerStyle = {
    ...style,
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: `${borderRadius}px`
  };

  const variantClass = solid ? 'glass-surface--solid' : 'glass-surface--fallback';

  return (
    <div className={`glass-surface ${variantClass} ${className}`} style={containerStyle}>
      <div className="glass-surface__content">{children}</div>
    </div>
  );
};

export default GlassSurface;
