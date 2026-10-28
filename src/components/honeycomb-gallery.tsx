"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AvIcon, type AvIconName } from "@/components/av-icon";

type PhotoCell = {
  kind: "photo";
  id: string;
  label: string;
  src: string;
  alt: string;
  title: string;
  body: string;
};

type FactsCell = {
  kind: "facts";
  id: string;
  label: string;
  icon: AvIconName;
  title: string;
  body: string;
  facts: { value: string; label: string }[];
};

type SeasonsCell = {
  kind: "seasons";
  id: string;
  label: string;
  icon: AvIconName;
  title: string;
  body: string;
  seasons: { name: string; months: string; note: string }[];
};

type NotesCell = {
  kind: "notes";
  id: string;
  label: string;
  icon: AvIconName;
  title: string;
  body: string;
  notes: string[];
};

type Cell = PhotoCell | FactsCell | SeasonsCell | NotesCell;

const CELLS: Cell[] = [
  {
    kind: "photo",
    id: "flower",
    label: "شکوفه و شهد",
    src: "/images/hive-gallery/bee-white-bloom.jpg",
    alt: "زنبور عسل در حال گرده‌افشانی بر شکوفه وحشی",
    title: "آغاز قصه از یک شکوفه",
    body: "شهد هر گل، عطر و طعم اقلیم خود را در قطره‌ای خالص به امانت می‌گذارد؛ از نخستین پرواز صبحگاهی تا ورود به کندو.",
  },
  {
    kind: "facts",
    id: "label",
    label: "معیار اصالت",
    icon: "jar",
    title: "سه‌گانهٔ اصالت عسل آوین",
    body: "سه اصل پایه‌ای که هر شیشهٔ عسل آوین بر اساس آن سنجیده، کنترل و عرضه می‌شود.",
    facts: [
      { value: "آزمون برگه", label: "پایش آزمایشگاهی فاکتورهای خلوص و ساکارز" },
      { value: "شهد خام", label: "تصفیه سنتی بدون حرارت بالا" },
      { value: "پرورش پاک", label: "زنبورداری مسئولانه در دامنه‌های کوهستان" },
    ],
  },
  {
    kind: "photo",
    id: "hive",
    label: "کندوی کوهستان",
    src: "/images/hive-gallery/wooden-hive.jpg",
    alt: "کندوهای چوبی سنتی در دامنه‌های سرسبز و آفتابی زاگرس",
    title: "آرامش در دامنه‌های زاگرس",
    body: "کندوهای چوبی آوین در مراتع و دشت‌های مرتفع زاگرس مستقرند؛ به دور از آلودگی‌های جاده‌ای و دشت‌های سم‌پاشی‌شده.",
  },
  {
    kind: "seasons",
    id: "harvest",
    label: "تقویم برداشت",
    icon: "sun",
    title: "چرخهٔ چهارفصل شهد",
    body: "عسل‌های آوین بر مبنای تقویم طبیعی گل‌دهی مراتع و مناطق زاگرس برداشت می‌شوند.",
    seasons: [
      { name: "بهار", months: "اردیبهشت و خرداد", note: "عسل بهارهٔ بهارنارنج و شکوفه‌های دشت" },
      { name: "تابستان", months: "تیر و مرداد", note: "عسل‌های کوهی آویشن و گون مراتع مرتفع" },
      { name: "پاییز", months: "شهریور و مهر", note: "برداشت عسل کنار و شهد گیاهان دارویی کوهپایه" },
    ],
  },
  {
    kind: "photo",
    id: "meadow",
    label: "مراتع خودرو",
    src: "/images/hive-gallery/iran-spring-meadow.jpg",
    alt: "چمنزار و دشت گل‌های وحشی زاگرس",
    title: "مراتع بکر و گیاهان دارویی",
    body: "پوشش گیاهی خودروی کوهستان زاگرس غنی‌ترین منبع تغذیهٔ طبیعی زنبورها در فصل شهدآوری است.",
  },
  {
    kind: "notes",
    id: "storage",
    label: "راز نگهداری",
    icon: "leaf",
    title: "چگونه عسل را تازه نگه داریم؟",
    body: "سه اصل بنیادین برای حفظ عطر، آنزیم‌ها و طعم زندهٔ عسل طبیعی در خانه.",
    notes: [
      "نگهداری در دمای معتدل اتاق و دور از تابش تند آفتاب",
      "استفاده همیشگی از قاشق خشک و تمیز برای جلوگیری از نفوذ رطوبت",
      "قرار دادن در ظرف آب ولرم در صورت رس‌بستن و شکرک طبیعی",
    ],
  },
];

export function HoneycombGallery() {
  const [openId, setOpenId] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const active = CELLS.find((cell) => cell.id === openId) ?? null;

  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => closeRef.current?.focus(), 40);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      clearTimeout(timer);
    };
  }, [active]);

  return (
    <>
      <section className="hive-gallery-section section-padding" id="hive-gallery" aria-labelledby="hive-gallery-title">
        <div className="page-width">
          <div className="hive-gallery-heading">
            <div>
              <p className="eyebrow">
                <AvIcon name="flower" size={16} /> شش پنجره به دنیای کندو
              </p>
              <h2 className="display" id="hive-gallery-title">
                طبیعت در <em>شش قاب تماشایی</em>
              </h2>
              <p>از ریتم شکوفه‌ها تا تقویم برداشت، خاستگاه و رازهای اصالت شهد.</p>
            </div>
          </div>
          <div className="hex-gallery" role="list" aria-label="شش قاب از دنیای عسل و کندو">
            {CELLS.map((cell) => (
              <button
                type="button"
                className={`hex-gallery-item hex-item-${cell.kind}`}
                key={cell.id}
                role="listitem"
                onClick={() => setOpenId(cell.id)}
                aria-label={`${cell.label}: ${cell.title}`}
              >
                {cell.kind === "photo" ? (
                  <Image
                    src={cell.src}
                    alt={cell.alt}
                    fill
                    sizes="(max-width: 720px) 46vw, (max-width: 900px) 30vw, 360px"
                    quality={75}
                    loading="lazy"
                  />
                ) : (
                  <span className="hex-artifact-art" aria-hidden="true">
                    <AvIcon name={cell.icon} size={32} />
                  </span>
                )}
                <span className="hex-gallery-shade" />
                <span className="hex-gallery-title">{cell.label}</span>
                <span className="hex-gallery-open">
                  <AvIcon name="sparkle" size={13} /> مشاهده
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {active && (
        <div
          className="hex-lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hex-modal-title"
          onClick={() => setOpenId(null)}
        >
          <button
            ref={closeRef}
            type="button"
            className="hex-lightbox-close"
            aria-label="بستن"
            onClick={() => setOpenId(null)}
          >
            <span aria-hidden="true">×</span>
          </button>
          <figure className="hex-lightbox-figure" onClick={(event) => event.stopPropagation()}>
            {active.kind === "photo" ? (
              <div className="hex-lightbox-image">
                <Image src={active.src} alt={active.alt} fill sizes="min(92vw, 900px)" quality={80} />
              </div>
            ) : (
              <div className="hex-lightbox-artifact">
                <span className="hex-artifact-icon">
                  <AvIcon
                    name={active.kind === "facts" ? "jar" : active.kind === "seasons" ? "sun" : "leaf"}
                    size={28}
                  />
                </span>
                {active.kind === "facts" && (
                  <ul className="hex-fact-list">
                    {active.facts.map((fact) => (
                      <li key={fact.value}>
                        <b dir="auto">{fact.value}</b>
                        <span>{fact.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {active.kind === "seasons" && (
                  <ol className="hex-season-list">
                    {active.seasons.map((season) => (
                      <li key={season.name}>
                        <b>{season.name}</b>
                        <span>{season.months}</span>
                        <small>{season.note}</small>
                      </li>
                    ))}
                  </ol>
                )}
                {active.kind === "notes" && (
                  <ol className="hex-note-list">
                    {active.notes.map((note) => (
                      <li key={note}>
                        <AvIcon name="check" size={14} />
                        {note}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
            <figcaption>
              <span className="hex-modal-badge">{active.label}</span>
              <h3 className="display" id="hex-modal-title">
                {active.title}
              </h3>
              <p>{active.body}</p>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
