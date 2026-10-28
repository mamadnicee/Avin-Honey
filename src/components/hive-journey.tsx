"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AvIcon, type AvIconName } from "@/components/av-icon";

const CHAPTERS: {
  id: string;
  icon: AvIconName;
  title: string;
  body: string;
  note: string;
}[] = [
  {
    id: "flower",
    icon: "flower",
    title: "از یک شکوفه شروع می‌شود.",
    body: "زنبورها میان گل‌های وحشی فصل و دامنه‌های کوهستان رفت‌وآمد می‌کنند؛ شهد و گردهٔ خالص را ذره‌ذره به کندو می‌آورند.",
    note: "ایستگاه اول · گلستان‌های بهاری",
  },
  {
    id: "mountain",
    icon: "forest",
    title: "هر دامنه، نشانی خودش را دارد.",
    body: "زنبورستان آوین با پرورش اختصاصی، در مراتع و دامنه‌های مرتفع زاگرس استقرار می‌یابد؛ خاستگاه هر برداشت شفاف و دقیق مشخص می‌شود.",
    note: "ایستگاه دوم · مراتع زاگرس",
  },
  {
    id: "jar",
    icon: "jar",
    title: "پایش آزمایشگاهی و بسته‌بندی بهداشتی.",
    body: "عسل بدون حرارت‌دهی و با حفظ تمامی آنزیم‌های زنده بسته‌بندی شده و شیشه‌ها با بسته‌بندی ایمن برای ارسال آماده می‌شوند.",
    note: "ایستگاه سوم · کارگاه اصفهان",
  },
  {
    id: "home",
    icon: "drop",
    title: "شیرینیِ خالص، به خانهٔ شما می‌رسد.",
    body: "یک طعم اصیل و پرخاصیت برای صبحانه، عصرانه یا یک هدیهٔ ماندگار؛ آمادهٔ ارسال مستقیم به سراسر ایران.",
    note: "ایستگاه چهارم · لحظه‌های شیرین شما",
  },
];

export function HiveJourney() {
  const [active, setActive] = useState(0);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    // The active station is the last card that has crossed the reading line.
    // Stable for the stacked deck: no flicker, no jumping back and forth.
    let frame = 0;
    let ticking = false;
    const update = () => {
      ticking = false;
      const line = window.innerHeight * 0.45;
      let best = 0;
      cardRefs.current.forEach((element, index) => {
        if (!element) return;
        if (element.getBoundingClientRect().top <= line) best = index;
      });
      setActive((current) => (current === best ? current : best));
    };
    const schedule = () => {
      if (ticking) return;
      ticking = true;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const progressRatio = active / (CHAPTERS.length - 1);

  return (
    <section className="hive-journey-section" id="story-route" aria-labelledby="hive-journey-title">
      <div className="page-width hive-journey-head">
        <p className="eyebrow">
          <AvIcon name="compass" size={16} /> چهار ایستگاه از کندو تا سفره
        </p>
        <h2 className="display" id="hive-journey-title">
          از یک گل، <em>تا خانهٔ تو</em>
        </h2>
        <p>با اسکرول همراه شوید؛ هر ایستگاه کشویی روی قبلی می‌نشیند.</p>
      </div>

      <div className="page-width hive-journey-layout">
        <div className="journey-art-column">
          <div className="journey-art-sticky">
            <span className="journey-art-kicker">مسیر شهد آوین</span>
            <div className="journey-rail" aria-hidden="true">
              <span className="journey-rail-line" />
              <span
                className="journey-rail-fill"
                style={{ "--journey-ratio": progressRatio } as CSSProperties}
              />
              {CHAPTERS.map((chapter, index) => (
                <button
                  type="button"
                  key={chapter.id}
                  className={`journey-rail-node journey-rail-node-${index}${
                    active === index ? " node-on" : ""
                  }`}
                  onClick={() => {
                    setActive(index);
                    cardRefs.current[index]?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                      inline: "center",
                    });
                  }}
                  aria-label={`رفتن به ${chapter.note}`}
                >
                  <AvIcon name={chapter.icon} size={17} />
                </button>
              ))}
            </div>
            <span className="journey-art-caption">
              <b>{CHAPTERS[active].note}</b>
            </span>
          </div>
        </div>

        <div className="journey-chapters-deck" role="region" aria-label="مراحل تولید و ارسال عسل">
          {CHAPTERS.map((chapter, index) => (
            <article
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              data-chapter-index={index}
              className={`journey-card-slide journey-card-${index}${
                active === index ? " is-current" : active > index ? " is-passed" : ""
              }`}
              key={chapter.id}
              style={{ "--card-depth": index } as CSSProperties}
            >
              <div className="journey-card-inner">
                <div className="journey-card-header">
                  <span className="journey-card-icon">
                    <AvIcon name={chapter.icon} size={22} />
                  </span>
                  <span className="journey-card-step">{chapter.note}</span>
                </div>
                <h3 className="display">{chapter.title}</h3>
                <p className="chapter-body">{chapter.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="journey-more">
        <Link href="/about">
          بیشتر دربارهٔ زنبورستان آوین <AvIcon name="arrow" size={16} />
        </Link>
      </div>
    </section>
  );
}
