import type { SVGProps } from "react";

export type AvIconName = "leaf" | "flower" | "forest" | "drop" | "arrow" | "sparkle" | "jar" | "sun" | "compass" | "check" | "pause" | "play" | "chevron" | "phone" | "shield" | "book";

export function AvIcon({ name, size = 22, ...props }: SVGProps<SVGSVGElement> & { name: AvIconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {name === "leaf" && <><path d="M20 3C12 2 5 5 4 11a6 6 0 0 0 6 6c6 0 10-8 10-14Z" /><path d="M3 21c2-5 6-9 12-12" /></>}
      {name === "flower" && <><path d="M12 14v7m0-3c-4 0-6-2-6-4m6 6c4 0 6-2 6-4" /><path d="M12 4c-3-5-9 1-5 4-5 3 0 9 4 5 3 5 9 0 5-4 5-3 0-9-4-5Z" /><circle cx="11.5" cy="8.5" r="2" /></>}
      {name === "forest" && <><path d="m15 2 5 6h-3l5 6h-6v7m-1-19-4 5m1 7h10" /><path d="M6 7a3 3 0 0 0-3 3 3 3 0 0 0-1 5c-1 3 2 4 4 4s5-1 4-4a3 3 0 0 0-1-5 3 3 0 0 0-3-3Zm0 12v3" /></>}
      {name === "drop" && <path d="M12 2c-4 6-7 9-7 13a7 7 0 0 0 14 0c0-4-3-7-7-13Zm-3 13c0 2 1 3 3 3" />}
      {name === "arrow" && <><path d="M20 12H4m6-6-6 6 6 6" /></>}
      {name === "sparkle" && <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" />}
      {name === "jar" && <><rect x="7" y="2" width="10" height="4" rx="1" /><path d="M7 6c-2 2-3 4-3 7v6a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-6c0-3-1-5-3-7ZM4 13h16" /></>}
      {name === "sun" && <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>}
      {name === "compass" && <><circle cx="12" cy="12" r="9" /><path d="m16 8-2 6-6 2 2-6 6-2Z" /></>}
      {name === "check" && <path d="m5 12 4.5 4.5L19 7" />}
      {name === "pause" && <path d="M9 5v14M15 5v14" strokeWidth="2.5" />}
      {name === "play" && <path d="m8 4 12 8-12 8V4Z" />}
      {name === "chevron" && <path d="m9 5 7 7-7 7" />}
      {name === "phone" && <path d="m8 3 2 5-3 2c2 4 3 5 7 7l2-3 5 2c0 4-2 6-5 5C8 19 5 16 3 8 2 5 4 3 8 3Z" />}
      {name === "shield" && <><path d="M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4Z" /><path d="m8 12 3 3 5-6" /></>}
      {name === "book" && <><path d="M12 5C9 3 5 3 2 4v16c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-7-1-10 1Zm0 0v17M6 8h2m-2 4h2m8-4h2m-2 4h2" /></>}
    </svg>
  );
}
