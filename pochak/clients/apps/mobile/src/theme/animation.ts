/** Player overlay animation timing constants (ms) */
export const ANIMATION = {
  /** Fade-in duration */
  FADE_IN: 200,
  /** Fade-out duration */
  FADE_OUT: 250,
  /** Quick-hide on re-tap while visible */
  QUICK_HIDE: 120,

  /** Auto-hide delay when playing */
  AUTO_HIDE_PLAYING: 3000,
  /** Auto-hide delay when paused */
  AUTO_HIDE_PAUSED: 5000,

  /** Seek indicator display time */
  SEEK_INDICATOR: 600,
  /** Cumulative double-tap window */
  DOUBLE_TAP_WINDOW: 600,

  /** Buffering spinner min display */
  BUFFERING_MIN_DISPLAY: 400,

  /** Safety timeout for splash/player load */
  SAFETY_TIMEOUT: 8000,
} as const;
