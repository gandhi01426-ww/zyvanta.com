interface Props {
  className?: string;
  /** Deprecated — kept for compatibility, no-op. */
  withSwitch?: boolean;
}

export const ZyvantaLogo = ({ className = "" }: Props) => (
  <span
    className={`font-display font-black tracking-[0.15em] neon-text ${className}`}
  >
    ZYVANTA
  </span>
);
