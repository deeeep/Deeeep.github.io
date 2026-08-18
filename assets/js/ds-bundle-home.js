/* @ds-bundle: {"format":4,"namespace":"TETDesignSystem_660675","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"PullQuote","sourcePath":"components/core/PullQuote.jsx"},{"name":"SectionDivider","sourcePath":"components/core/SectionDivider.jsx"},{"name":"ChapterNav","sourcePath":"components/fables-reader/ChapterNav.jsx"},{"name":"ChapterOpener","sourcePath":"components/fables-reader/ChapterOpener.jsx"},{"name":"ChapterWash","sourcePath":"components/fables-reader/ChapterWash.jsx"},{"name":"Citation","sourcePath":"components/fables-reader/Citation.jsx"},{"name":"ProgressDots","sourcePath":"components/fables-reader/ProgressDots.jsx"},{"name":"ReflectionQuestions","sourcePath":"components/fables-reader/ReflectionQuestions.jsx"},{"name":"StoryText","sourcePath":"components/fables-reader/StoryText.jsx"},{"name":"TocDrawer","sourcePath":"components/fables-reader/TocDrawer.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"f6dec1f31ed3","components/core/Button.jsx":"e602e0effdc8","components/core/Card.jsx":"7df2e011de3b","components/core/PullQuote.jsx":"e13ffe509853","components/core/SectionDivider.jsx":"24071a2e9ac7","components/fables-reader/ChapterNav.jsx":"fa2f3c1cf342","components/fables-reader/ChapterOpener.jsx":"8c8c05578f52","components/fables-reader/ChapterWash.jsx":"c615fa0821ea","components/fables-reader/Citation.jsx":"0b249a325f40","components/fables-reader/ProgressDots.jsx":"568390367f20","components/fables-reader/ReflectionQuestions.jsx":"98752280b0bd","components/fables-reader/StoryText.jsx":"eb99b50b5979","components/fables-reader/TocDrawer.jsx":"be24663247da"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.TETDesignSystem_660675 = window.TETDesignSystem_660675 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function Badge({
  tone = 'neutral',
  children
}) {
  const tones = {
    neutral: {
      background: 'var(--paper-deep)',
      color: 'var(--text-secondary)'
    },
    live: {
      background: 'var(--jewel-moss)',
      color: 'var(--paper)'
    },
    development: {
      background: 'var(--jewel-ochre)',
      color: 'var(--ink)'
    },
    forming: {
      background: 'var(--jewel-plum)',
      color: 'var(--paper)'
    }
  };
  return React.createElement('span', {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      letterSpacing: 'var(--tracking-wider)',
      textTransform: 'uppercase',
      padding: '4px 10px',
      borderRadius: 'var(--radius-full)',
      display: 'inline-block',
      ...tones[tone]
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick
}) {
  const pad = size === 'sm' ? '8px 14px' : size === 'lg' ? '16px 28px' : '12px 20px';
  const fontSize = size === 'sm' ? 'var(--text-xs)' : size === 'lg' ? 'var(--text-lg)' : 'var(--text-sm)';
  const base = {
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize,
    padding: pad,
    borderRadius: 'var(--radius-sm)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1px solid transparent',
    transition: 'background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)',
    opacity: disabled ? 0.5 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    letterSpacing: '0.01em'
  };
  const variants = {
    primary: {
      background: 'var(--accent-primary)',
      color: 'var(--ink)',
      borderColor: 'var(--accent-primary)'
    },
    secondary: {
      background: 'transparent',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-strong)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--link)',
      borderColor: 'transparent',
      padding: pad,
      textDecoration: 'underline',
      textUnderlineOffset: '3px'
    }
  };
  return React.createElement('button', {
    style: {
      ...base,
      ...variants[variant]
    },
    disabled,
    onClick
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function Card({
  children,
  padding = 'md'
}) {
  const pad = padding === 'sm' ? 'var(--space-4)' : padding === 'lg' ? 'var(--space-7)' : 'var(--space-5)';
  return React.createElement('div', {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-card)',
      padding: pad
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/PullQuote.jsx
try { (() => {
function PullQuote({
  children,
  attribution
}) {
  return React.createElement('figure', {
    style: {
      margin: 0,
      padding: '0 0 0 var(--space-5)',
      borderLeft: '2px solid var(--accent-primary)'
    }
  }, React.createElement('blockquote', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontSize: 'var(--text-xl)',
      lineHeight: 'var(--leading-snug)',
      color: 'var(--text-primary)'
    }
  }, children), attribution && React.createElement('figcaption', {
    style: {
      marginTop: 'var(--space-3)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)'
    }
  }, attribution));
}
Object.assign(__ds_scope, { PullQuote });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/PullQuote.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionDivider.jsx
try { (() => {
function SectionDivider({
  label
}) {
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      margin: 'var(--space-6) 0'
    }
  }, label && React.createElement('span', {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-wider)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap'
    }
  }, label), React.createElement('span', {
    style: {
      flex: 1,
      height: '1px',
      background: 'var(--border-default)'
    }
  }));
}
Object.assign(__ds_scope, { SectionDivider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionDivider.jsx", error: String((e && e.message) || e) }); }

// components/fables-reader/ChapterNav.jsx
try { (() => {
const btnStyle = {
  background: 'none',
  border: '1px solid var(--rule)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.88rem',
  color: 'var(--muted-ink)',
  padding: '10px 20px',
  cursor: 'pointer',
  letterSpacing: '0.03em'
};
function ChapterNav({
  prevLabel,
  onPrev,
  nextLabel,
  onNext,
  copyright
}) {
  return /*#__PURE__*/React.createElement("div", null, copyright && /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      fontSize: '0.72rem',
      letterSpacing: '0.08em',
      color: 'var(--muted-ink)',
      marginTop: 40,
      paddingTop: 20,
      borderTop: '1px solid var(--rule)',
      fontFamily: 'var(--font-body)'
    }
  }, copyright), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 24,
      paddingTop: 32,
      borderTop: copyright ? 'none' : '1px solid var(--rule)',
      gap: 16
    }
  }, prevLabel ? /*#__PURE__*/React.createElement("button", {
    style: btnStyle,
    onClick: onPrev
  }, prevLabel) : /*#__PURE__*/React.createElement("span", null), nextLabel && /*#__PURE__*/React.createElement("button", {
    style: {
      ...btnStyle,
      marginLeft: 'auto'
    },
    onClick: onNext
  }, nextLabel)));
}
Object.assign(__ds_scope, { ChapterNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/fables-reader/ChapterNav.jsx", error: String((e && e.message) || e) }); }

// components/fables-reader/ChapterOpener.jsx
try { (() => {
function ChapterOpener({
  image,
  caption,
  eyebrow,
  title,
  epigraph,
  accent = 'var(--accent-primary-1)'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      aspectRatio: '3/2',
      overflow: 'hidden',
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: title,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }
  }), caption && /*#__PURE__*/React.createElement("p", {
    style: {
      position: 'absolute',
      bottom: 108,
      right: 24,
      fontSize: '0.68rem',
      letterSpacing: '0.08em',
      fontStyle: 'italic',
      color: 'var(--plate-caption-light)',
      margin: 0,
      pointerEvents: 'none',
      fontFamily: 'var(--font-body)',
      background: 'rgba(250,249,245,0.7)',
      padding: '2px 8px',
      borderRadius: 3
    }
  }, caption), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: '80px max(32px, 5%) 36px',
      background: 'var(--plate-scrim)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '0.7rem',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: accent,
      margin: '0 0 14px'
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
      lineHeight: 1.2,
      color: 'var(--ink-base)',
      margin: '0 0 10px'
    }
  }, title), epigraph && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-hand)',
      fontWeight: 600,
      color: 'var(--muted-ink-strong)',
      fontSize: '1.3rem',
      margin: 0
    }
  }, epigraph)));
}
Object.assign(__ds_scope, { ChapterOpener });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/fables-reader/ChapterOpener.jsx", error: String((e && e.message) || e) }); }

// components/fables-reader/ChapterWash.jsx
try { (() => {
function ChapterWash({
  image,
  tintA,
  tintB,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      background: `linear-gradient(180deg, ${tintA}, ${tintB})`
    }
  }, image && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      opacity: 0.16,
      filter: 'saturate(0.75)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--surface-page)',
      opacity: 0.72
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, children));
}
Object.assign(__ds_scope, { ChapterWash });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/fables-reader/ChapterWash.jsx", error: String((e && e.message) || e) }); }

// components/fables-reader/Citation.jsx
try { (() => {
function Citation({
  author,
  title,
  note
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 0',
      borderBottom: '1px solid var(--rule)',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontStyle: 'italic',
      color: 'var(--muted-ink)',
      fontSize: '0.9rem',
      margin: '0 0 4px'
    }
  }, author), /*#__PURE__*/React.createElement("p", {
    style: {
      fontWeight: 500,
      margin: '0 0 6px',
      fontSize: '0.97rem',
      color: 'var(--ink-base)'
    }
  }, title), note && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '0.88rem',
      color: 'var(--muted-ink-strong)',
      lineHeight: 1.6,
      margin: 0
    }
  }, note));
}
Object.assign(__ds_scope, { Citation });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/fables-reader/Citation.jsx", error: String((e && e.message) || e) }); }

// components/fables-reader/ProgressDots.jsx
try { (() => {
function ProgressDots({
  count,
  active,
  onSelect,
  dark = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 5
    }
  }, Array.from({
    length: count
  }).map((_, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => onSelect && onSelect(i),
    "aria-label": `Go to section ${i + 1}`,
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      background: i === active ? 'var(--gold-base)' : dark ? 'var(--cream-faint)' : 'var(--rule)'
    }
  })));
}
Object.assign(__ds_scope, { ProgressDots });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/fables-reader/ProgressDots.jsx", error: String((e && e.message) || e) }); }

// components/fables-reader/ReflectionQuestions.jsx
try { (() => {
function ReflectionQuestions({
  intro,
  groups,
  accent = 'var(--accent-primary-1)'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 56,
      paddingTop: 40,
      borderTop: '1px solid var(--rule)',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '0.68rem',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: accent,
      margin: '0 0 16px'
    }
  }, "Reflections"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-hand)',
      fontWeight: 600,
      fontSize: '1.5rem',
      margin: '0 0 24px',
      color: 'var(--muted-ink)'
    }
  }, intro), groups.map((g, gi) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: gi
  }, g.label && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '0.72rem',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      color: accent,
      margin: '28px 0 12px'
    }
  }, g.label), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      borderTop: '1px solid var(--rule)',
      margin: 0,
      padding: 0
    }
  }, g.items.map((q, qi) => /*#__PURE__*/React.createElement("li", {
    key: qi,
    style: {
      padding: '14px 0 14px 28px',
      borderBottom: '1px solid var(--rule)',
      position: 'relative',
      color: 'var(--muted-ink-strongest)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 0,
      color: accent
    }
  }, "\u2014"), q))))));
}
Object.assign(__ds_scope, { ReflectionQuestions });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/fables-reader/ReflectionQuestions.jsx", error: String((e && e.message) || e) }); }

// components/fables-reader/StoryText.jsx
try { (() => {
function StoryText({
  paragraphs,
  ornamentAfter = [],
  pullQuote,
  accent = 'var(--accent-primary-1)'
}) {
  const pStyle = {
    margin: '0 0 1.4em',
    textAlign: 'justify',
    hyphens: 'auto',
    lineHeight: 1.82,
    fontFamily: 'var(--font-body)',
    color: 'var(--ink-base)',
    fontSize: '1rem'
  };
  const ornStyle = {
    textAlign: 'center',
    color: accent,
    letterSpacing: '0.4em',
    margin: '2.2em 0',
    fontSize: '0.9rem'
  };
  return /*#__PURE__*/React.createElement("div", null, paragraphs.map((p, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, /*#__PURE__*/React.createElement("p", {
    style: i === paragraphs.length - 1 ? {
      ...pStyle,
      marginBottom: 0
    } : pStyle
  }, p), ornamentAfter.includes(i) && /*#__PURE__*/React.createElement("div", {
    style: ornStyle
  }, "\xB7 \xB7 \xB7"))), pullQuote && /*#__PURE__*/React.createElement("div", {
    style: {
      borderLeft: `2px solid ${accent}`,
      padding: '16px 24px',
      margin: '2.5em 0',
      fontFamily: 'var(--font-hand)',
      fontWeight: 600,
      fontSize: '1.3rem',
      background: 'var(--gold-dim)',
      color: 'var(--muted-ink-stronger)',
      textAlign: 'left'
    }
  }, pullQuote));
}
Object.assign(__ds_scope, { StoryText });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/fables-reader/StoryText.jsx", error: String((e && e.message) || e) }); }

// components/fables-reader/TocDrawer.jsx
try { (() => {
function TocDrawer({
  open,
  onClose,
  items,
  activeIdx,
  onSelect
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(26,18,8,0.15)',
      zIndex: 100,
      opacity: open ? 1 : 0,
      pointerEvents: open ? 'all' : 'none',
      transition: 'opacity 0.3s'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: open ? 0 : -340,
      width: 320,
      height: '100vh',
      background: 'var(--surface-chrome)',
      color: 'var(--text-on-chrome)',
      zIndex: 110,
      overflowY: 'auto',
      transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
      fontFamily: 'var(--font-body)',
      borderRight: '1px solid var(--surface-chrome-border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 28px',
      borderBottom: '1px solid var(--surface-chrome-border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'var(--accent-primary-1)'
    }
  }, "Fables for Exceptional Times"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--text-on-chrome-muted)',
      cursor: 'pointer',
      fontSize: '1.4rem',
      lineHeight: 1,
      padding: '4px 8px'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      padding: '16px 0 60px',
      margin: 0
    }
  }, items.map(it => /*#__PURE__*/React.createElement("li", {
    key: it.idx,
    style: {
      borderBottom: '1px solid rgba(198,154,58,0.12)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onSelect(it.idx);
    },
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 14,
      padding: '13px 28px',
      color: it.idx === activeIdx ? 'var(--accent-primary-2)' : 'var(--text-on-chrome)',
      textDecoration: 'none',
      fontSize: '0.95rem'
    }
  }, it.roman && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      color: 'var(--accent-primary-1)',
      opacity: 0.85,
      fontSize: '0.8rem',
      minWidth: 22
    }
  }, it.roman), it.label), it.sub && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.78rem',
      color: 'var(--text-on-chrome-faint)',
      padding: '0 28px 10px 64px',
      display: 'block',
      letterSpacing: '0.04em'
    }
  }, it.sub))))));
}
Object.assign(__ds_scope, { TocDrawer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/fables-reader/TocDrawer.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.PullQuote = __ds_scope.PullQuote;

__ds_ns.SectionDivider = __ds_scope.SectionDivider;

__ds_ns.ChapterNav = __ds_scope.ChapterNav;

__ds_ns.ChapterOpener = __ds_scope.ChapterOpener;

__ds_ns.ChapterWash = __ds_scope.ChapterWash;

__ds_ns.Citation = __ds_scope.Citation;

__ds_ns.ProgressDots = __ds_scope.ProgressDots;

__ds_ns.ReflectionQuestions = __ds_scope.ReflectionQuestions;

__ds_ns.StoryText = __ds_scope.StoryText;

__ds_ns.TocDrawer = __ds_scope.TocDrawer;

})();
