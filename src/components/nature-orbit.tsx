"use client";

import { useId, useState } from "react";
import { AvIcon, type AvIconName } from "@/components/av-icon";

const WORLDS: { id: string; icon: AvIconName; name: string; caption: string }[] = [
  { id: "flower", icon: "flower", name: "دنیای گل‌ها", caption: "رایحهٔ گل، لطیف و روشن" },
  { id: "meadow", icon: "leaf", name: "دشت و کوهستان", caption: "چند رایحه، در یک قاشق" },
  { id: "forest", icon: "forest", name: "سایهٔ جنگل", caption: "عطرهای عمیق، طعم‌های پررنگ" },
];

export function BeeEmblem() {
  const id = useId();
  return <svg className="line-bee" viewBox="0 0 240 220" fill="none" aria-hidden="true">
    <defs><clipPath id={id}><ellipse cx="117" cy="125" rx="69" ry="45" /></clipPath></defs>
    <g stroke="#376047" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
      <g className="bee-wing-motion wing-left-motion"><ellipse className="line-bee-wing" cx="92" cy="67" rx="23" ry="40" fill="#fffef9" transform="rotate(-24 92 67)" /></g>
      <g className="bee-wing-motion wing-right-motion"><ellipse className="line-bee-wing" cx="141" cy="52" rx="25" ry="46" fill="#fffef9" transform="rotate(-12 141 52)" /></g>
      <g transform="rotate(-13 117 125)"><ellipse cx="117" cy="125" rx="69" ry="45" fill="#f3c747" /><g clipPath={`url(#${id})`} strokeWidth="13"><path d="M82 73c-14 39-8 80 14 106M112 72c-9 40-3 80 15 106M144 77c-6 34-1 69 15 91" /></g><ellipse cx="117" cy="125" rx="69" ry="45" /><circle cx="166" cy="113" r="4.3" fill="#376047" stroke="none" /><path d="m181 107 22-9m-18 25 22 5M84 166l-7 15m49-12 1 15M48 124l-13 3" /><path d="M168 139c4 2 7 0 9-3" strokeWidth="2.5" /></g>
    </g>
  </svg>;
}

export function NatureOrbit() {
  const [active, setActive] = useState(1);
  return <div className="nature-orbit-wrap"><div className={`nature-orbit orbit-${WORLDS[active].id}`}>
    <span className="orbit-ring ring-outer" aria-hidden="true" /><span className="orbit-ring ring-inner" aria-hidden="true" /><span className="orbit-center"><BeeEmblem /></span>
    {WORLDS.map((world, index) => <button key={world.id} type="button" className={`orbit-node node-${index}${active === index ? " node-active" : ""}`} onClick={() => setActive(index)} aria-label={world.name} aria-pressed={active === index}><AvIcon name={world.icon} size={30} /></button>)}
    <span className="orbit-mini-hex" aria-hidden="true">⬡</span><span className="orbit-tiny-dot" aria-hidden="true" />
  </div><div className="orbit-caption" aria-live="polite"><span className="orbit-caption-line" /><span><b>{WORLDS[active].name}</b><small>{WORLDS[active].caption}</small></span><span className="orbit-caption-line" /></div><span className="orbit-instruction">روی نشانه‌ها بزن؛ از طبیعت شروع کن.</span></div>;
}
