export function BrandMark({ size = 44 }: { size?: number }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none">
        <path d="M24 1.5 43.5 12.75v22.5L24 46.5 4.5 35.25v-22.5L24 1.5Z" fill="#eab12e" />
        <path d="M24 6 39.6 15v18L24 42 8.4 33V15L24 6Z" fill="#fffdf5" />
        <path d="M24 13.5c4.9 5.3 7.3 9.1 7.3 12.3a7.3 7.3 0 1 1-14.6 0c0-3.2 2.4-7 7.3-12.3Z" fill="#dca221" />
        <path d="M20.9 26.2a3.4 3.4 0 0 0 2.9 3.3" stroke="#fffdf5" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </span>
  );
}
