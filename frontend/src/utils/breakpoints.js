/**
 * Escala unica de breakpoints para la logica JS.
 * Debe coincidir con la documentada en src/styles/base.css.
 */
export const BREAKPOINTS = Object.freeze({
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
});

export const MEDIA = Object.freeze({
  mobile: `(max-width: ${BREAKPOINTS.md}px)`,
  tablet: `(max-width: ${BREAKPOINTS.lg}px)`,
  desktop: `(min-width: ${BREAKPOINTS.lg + 1}px)`,
  reduceMotion: "(prefers-reduced-motion: reduce)",
});
