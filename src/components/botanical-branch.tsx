"use client";

import { useEffect, useRef } from "react";

export function BotanicalBranch({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    element.dataset.bloom = "waiting";
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { element.dataset.bloom = "ready"; observer.disconnect(); } }, { threshold: .08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <svg ref={ref} className={`botanical-branch ${className}`} viewBox="0 0 260 480" fill="none" aria-hidden="true">
      <g className="botanical-sway" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path className="botanical-stem" pathLength="1" d="M54 467C100 369 77 265 126 154c18-40 48-71 69-102" strokeWidth="2" />
        <path className="botanical-leaf leaf-a" pathLength="1" d="M85 379c-54-13-77-51-81-94 53 4 91 40 81 94Z" fill="currentColor" fillOpacity=".045" strokeWidth="1.3" />
        <path className="botanical-leaf leaf-b" pathLength="1" d="M91 316c8-52 43-86 96-91-7 48-42 83-96 91Z" fill="currentColor" fillOpacity=".045" strokeWidth="1.3" />
        <path className="botanical-leaf leaf-c" pathLength="1" d="M109 251c-48-14-71-45-77-89 47 5 82 37 77 89Z" fill="currentColor" fillOpacity=".04" strokeWidth="1.3" />
        <path className="botanical-leaf leaf-d" pathLength="1" d="M129 177c11-42 45-69 91-68-9 37-43 65-91 68Z" fill="currentColor" fillOpacity=".035" strokeWidth="1.3" />
        <path className="botanical-leaf leaf-e" pathLength="1" d="M158 109c-26-21-34-48-28-77 30 17 42 44 28 77Z" strokeWidth="1.3" />
        <g className="botanical-flower" strokeWidth="1.3"><circle cx="207" cy="43" r="8" /><path pathLength="1" d="M207 35c-18-21-30 0-12 8-24 12-7 28 12 8 11 23 31 7 8-8 23-12 6-31-8-8Z" /></g>
        <path className="botanical-vein" pathLength="1" d="m85 379-54-58m60-5 66-62m-48-3-52-61m72-13 62-45" strokeWidth=".65" opacity=".5" />
      </g>
    </svg>
  );
}
