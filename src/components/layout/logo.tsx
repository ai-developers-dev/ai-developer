/**
 * "The Arch" — the AI Developer logo mark.
 * 32×32 viewBox: rounded-square outline, an orange arch, and a white crossbar.
 * The 8px corner radius here is the one rounded corner in the whole design.
 */
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block', flex: 'none' }}
    >
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="8"
        stroke="rgba(255,255,255,0.32)"
        strokeWidth="1.4"
      />
      <path
        d="M8.5 24V15.5a7.5 7.5 0 0 1 15 0V24"
        stroke="#EF6A00"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M8.5 19.5h15" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/** Logo mark + AI_DEVELOPER wordmark. */
export function Logo({ size = 26 }: { size?: number }) {
  return (
    <span className="flex items-center gap-3">
      <LogoMark size={size} />
      <span className="text-[13px] font-bold tracking-[0.16em] text-white">
        AI_DEVELOPER
      </span>
    </span>
  )
}
