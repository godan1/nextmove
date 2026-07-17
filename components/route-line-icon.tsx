type RouteLineProps = {
  className?: string;
  stops?: number;
};

/**
 * The page's signature device: a stenciled route with pins. Used decoratively
 * in the hero, and functionally (re-skinned) as the quote form's step
 * indicator — a move genuinely is a line with stops, so this is doing real
 * work, not just decorating a section.
 */
export function RouteLineIcon({ className }: RouteLineProps) {
  return (
    <svg
      viewBox="0 0 340 120"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 90 C 90 90, 80 20, 170 20 S 260 90, 328 30"
        stroke="#0B4C5F"
        strokeWidth="2"
        strokeDasharray="1 10"
        strokeLinecap="round"
      />
      <circle cx="12" cy="90" r="7" fill="#C1502B" />
      <circle cx="12" cy="90" r="2.5" fill="white" />
      <circle cx="328" cy="30" r="7" fill="#1F6B4F" />
      <circle cx="328" cy="30" r="2.5" fill="white" />
    </svg>
  );
}
