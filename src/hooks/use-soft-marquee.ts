"use client";

import { useEffect, useRef, type MouseEvent } from "react";

/** Native touch momentum owns the rail until scrolling has fully settled. */
export function useSoftMarquee(itemCount: number, paused: boolean) {
  const track = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = false;
    let hovering = false;
    let keyboardFocus = false;
    let manual = false;
    let pointerDown = false;
    let mouseStart: { x: number; scroll: number; id: number } | null = null;
    let resumeTimer: ReturnType<typeof setTimeout> | undefined;
    let clickTimer: ReturnType<typeof setTimeout> | undefined;
    let position = Math.max(0, -el.scrollLeft);
    let manualPosition = position;
    let direction = 1;
    let previous = 0;
    const max = () => Math.max(0, el.scrollWidth - el.clientWidth);
    const current = () => Math.max(0, Math.min(max(), -el.scrollLeft));
    const allowed = () => visible && !hovering && !keyboardFocus && !manual && !pointerDown && !paused && !reduced.matches && !document.hidden;

    function stop() { cancelAnimationFrame(frame); frame = 0; previous = 0; }
    function animate(now: number) {
      frame = 0;
      if (!allowed() || max() <= 2) return;
      const elapsed = previous ? Math.min(40, now - previous) : 0;
      previous = now;
      position += direction * elapsed * 0.021;
      if (position >= max()) { position = max(); direction = -1; }
      if (position <= 0) { position = 0; direction = 1; }
      el!.scrollLeft = -position;
      frame = requestAnimationFrame(animate);
    }
    function reconcile() {
      if (!allowed() || max() <= 2) { stop(); return; }
      if (!frame) { position = current(); previous = 0; frame = requestAnimationFrame(animate); }
    }
    function settleLater() {
      clearTimeout(resumeTimer);
      if (pointerDown) return;
      resumeTimer = setTimeout(() => { manual = false; delete el!.dataset.motion; position = current(); reconcile(); }, 1800);
    }
    function userTakesControl() { manual = true; el!.dataset.motion = "manual"; manualPosition = current(); stop(); clearTimeout(resumeTimer); }
    function onScroll() {
      if (!manual && !pointerDown) return;
      const next = current();
      if (Math.abs(next - manualPosition) > 1) direction = next > manualPosition ? 1 : -1;
      manualPosition = next;
      // Every momentum scroll pushes the deadline out; no stale-position jump.
      settleLater();
    }
    function onDown(event: PointerEvent) {
      pointerDown = true; keyboardFocus = false; dragged.current = false;
      userTakesControl();
      if (event.pointerType === "mouse" && event.button === 0) mouseStart = { x: event.clientX, scroll: el!.scrollLeft, id: event.pointerId };
    }
    function onMove(event: PointerEvent) {
      if (!mouseStart || event.pointerType !== "mouse") return;
      const delta = event.clientX - mouseStart.x;
      if (Math.abs(delta) > 5) {
        dragged.current = true;
        el!.dataset.dragging = "true";
        if (!el!.hasPointerCapture(event.pointerId)) el!.setPointerCapture(event.pointerId);
        event.preventDefault();
        el!.scrollLeft = mouseStart.scroll - delta;
      }
    }
    function onUp(event?: PointerEvent) {
      if (mouseStart && event && el!.hasPointerCapture(mouseStart.id)) el!.releasePointerCapture(mouseStart.id);
      mouseStart = null; pointerDown = false;
      delete el!.dataset.dragging;
      settleLater();
      clearTimeout(clickTimer); clickTimer = setTimeout(() => { dragged.current = false; }, 0);
    }
    function onTouchStart() { pointerDown = true; keyboardFocus = false; userTakesControl(); }
    function onTouchEnd() { pointerDown = false; settleLater(); }
    function onEnter(event: PointerEvent) { if (event.pointerType === "mouse") { hovering = true; reconcile(); } }
    function onLeave(event: PointerEvent) { if (event.pointerType === "mouse") { hovering = false; if (!mouseStart) reconcile(); } }
    function onWheel() { if (!manual) userTakesControl(); settleLater(); }
    function onKey(event: KeyboardEvent) {
      if (["ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown", " "].includes(event.key)) { keyboardFocus = true; userTakesControl(); settleLater(); }
    }
    function onFocus() { keyboardFocus = el!.matches(":focus-visible") || !!el!.querySelector(":focus-visible"); reconcile(); }
    function onBlur(event: FocusEvent) { if (!el!.contains(event.relatedTarget as Node | null)) { keyboardFocus = false; reconcile(); } }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; reconcile(); }, { threshold: 0.1 });
    const resize = new ResizeObserver(() => { position = current(); reconcile(); });
    observer.observe(el); resize.observe(el);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", onScroll);
    el.addEventListener("keydown", onKey);
    el.addEventListener("focusin", onFocus);
    el.addEventListener("focusout", onBlur);
    document.addEventListener("visibilitychange", reconcile);
    reduced.addEventListener("change", reconcile);
    return () => {
      stop(); clearTimeout(resumeTimer); clearTimeout(clickTimer); observer.disconnect(); resize.disconnect();
      delete el.dataset.dragging; delete el.dataset.motion;
      el.removeEventListener("pointerdown", onDown); el.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp); el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerenter", onEnter); el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("touchstart", onTouchStart); el.removeEventListener("touchend", onTouchEnd); el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("wheel", onWheel); el.removeEventListener("scroll", onScroll); el.removeEventListener("scrollend", onScroll);
      el.removeEventListener("keydown", onKey); el.removeEventListener("focusin", onFocus); el.removeEventListener("focusout", onBlur);
      document.removeEventListener("visibilitychange", reconcile); reduced.removeEventListener("change", reconcile);
    };
  }, [itemCount, paused]);

  function suppressDragClick(event: MouseEvent<HTMLDivElement>) { if (dragged.current) { event.preventDefault(); event.stopPropagation(); } }
  return { track, suppressDragClick };
}
