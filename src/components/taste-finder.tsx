"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AvIcon, type AvIconName } from "@/components/av-icon";

const QUESTIONS: { title: string; hint: string; options: { title: string; hint: string; icon: AvIconName; value: string }[] }[] = [
  { title: "کدام عطر، بیشتر تو را می‌برد؟", hint: "از رایحه‌ای شروع کن که دوستش داری.", options: [
    { title: "شکوفه و گل", hint: "لطیف، آشنا، بهاری", icon: "flower", value: "flower" },
    { title: "دشت و گیاه", hint: "چندلایه و متعادل", icon: "leaf", value: "meadow" },
    { title: "چوب و جنگل", hint: "عمیق و پررنگ", icon: "forest", value: "forest" },
  ] },
  { title: "طعم را چقدر پررنگ می‌پسندی؟", hint: "هیچ پاسخ درست یا غلطی وجود ندارد.", options: [
    { title: "آرام و لطیف", hint: "یک همراه ملایم", icon: "drop", value: "soft" },
    { title: "متعادل", hint: "نه خیلی کم، نه خیلی زیاد", icon: "sun", value: "balanced" },
    { title: "قوی و ماندگار", hint: "طعمی که به یاد بماند", icon: "sparkle", value: "bold" },
  ] },
  { title: "عسل، همراه کدام لحظهٔ توست؟", hint: "یک انتخاب کوچک برای روزهای شیرین‌تر.", options: [
    { title: "صبحانهٔ آرام", hint: "نان، کره و یک شروع خوب", icon: "sun", value: "breakfast" },
    { title: "کنار چای و دمنوش", hint: "یک مکث در شلوغی روز", icon: "leaf", value: "tea" },
    { title: "هدیه‌ای از طبیعت", hint: "برای یک آدم دوست‌داشتنی", icon: "jar", value: "gift" },
  ] },
];

export function TasteFinder({ categories, onChoose }: { categories: { name: string; count: number }[]; onChoose?: (category: string) => void }) {
  const [answers, setAnswers] = useState<string[]>([]);
  const [selection, setSelection] = useState("");
  const titleRef = useRef<HTMLHeadingElement>(null);
  const complete = answers.length === QUESTIONS.length;
  const question = QUESTIONS[Math.min(answers.length, QUESTIONS.length - 1)];
  const category = answers[0] === "flower" ? "تک‌گل" : answers[0] === "forest" ? "ویژه" : "چندگیاه";
  const count = categories.find((entry) => entry.name === category)?.count ?? 0;
  const title = category === "تک‌گل" ? "به دنیای گل‌ها نزدیک‌تری." : category === "ویژه" ? "اهل طعم‌های به‌یادماندنی هستی." : "سلیقه‌ات بوی دشت می‌دهد.";

  function focusTitle() {
    requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true }));
  }
  function next() {
    if (!selection) return;
    setAnswers((current) => [...current, selection]);
    setSelection("");
    focusTitle();
  }
  function reset() { setAnswers([]); setSelection(""); focusTitle(); }

  return (
    <div className="taste-experience">
      <div className="taste-intro">
        <span className="taste-number" aria-hidden="true">۰۳</span>
        <p className="eyebrow light"><AvIcon name="compass" size={17} /> طعم‌نمای آوین</p>
        <h2 className="display">گل‌دوستی یا<br /><em>هم‌قدم جنگل؟</em></h2>
        <p>سه سؤال کوتاه؛ یک مسیر برای نزدیک‌تر شدن به طعم دلخواهت.</p>
        <span className="taste-time"><span /> کمتر از یک دقیقه · بدون ثبت‌نام</span>
        <span className="taste-doodle" aria-hidden="true">⬡</span>
      </div>
      <div className="taste-panel">
        <div className="taste-progress" aria-label={`پیشرفت: ${answers.length} از ۳ سؤال`}>
          {[0, 1, 2].map((i) => <span key={i} className={i <= answers.length ? "step-done" : ""} />)}
        </div>
        {complete ? (
          <div className="taste-result" aria-live="polite">
            <span className="taste-result-icon"><AvIcon name={category === "تک‌گل" ? "flower" : category === "ویژه" ? "forest" : "leaf"} size={34} /></span>
            <p className="taste-step-label">مسیر پیشنهادی تو</p>
            <h3 ref={titleRef} tabIndex={-1} className="display">{title}</h3>
            <p>{answers[1] === "bold" ? "در توضیحات محصول، سراغ طعم‌های عمیق و رایحهٔ پررنگ برو." : "در توضیحات محصول، به رایحه و شدت طعم دقت کن؛ رنگ عسل به‌تنهایی معیار کیفیت نیست."}</p>
            <span className="taste-match">دستهٔ پیشنهادی: <b>{category}</b></span>
            {count > 0 ? <p className="taste-availability">{new Intl.NumberFormat("fa-IR").format(count)} محصول در این گروه موجود است.</p> : <p className="taste-availability">محصولات این دسته به‌زودی در ویترین قرار می‌گیرند.</p>}
            {onChoose ? <button className="button button-green" onClick={() => onChoose(category)}>رفتن به ویترین <AvIcon name="arrow" size={18} /></button> : <Link className="button button-green" href={`/?category=${encodeURIComponent(category)}#products`}>دیدن ویترین <AvIcon name="arrow" size={18} /></Link>}
            <button className="taste-reset" type="button" onClick={reset}>یک بار دیگر کشف کنم</button>
          </div>
        ) : (
          <>
            <p className="taste-step-label">پرسش {new Intl.NumberFormat("fa-IR").format(answers.length + 1)} از ۳</p>
            <h3 ref={titleRef} tabIndex={-1} className="display">{question.title}</h3>
            <p className="taste-hint">{question.hint}</p>
            <div className="taste-options" role="group" aria-label={question.title}>
              {question.options.map((option) => (
                <button type="button" key={option.value} aria-pressed={selection === option.value} onClick={() => setSelection(option.value)} className={`taste-option${selection === option.value ? " option-selected" : ""}`}>
                  <span className="taste-option-icon"><AvIcon name={option.icon} size={24} /></span>
                  <span><b>{option.title}</b><small>{option.hint}</small></span>
                  <span className="taste-radio">{selection === option.value && <AvIcon name="check" size={13} />}</span>
                </button>
              ))}
            </div>
            <div className="taste-actions">
              <button type="button" className="button button-green" disabled={!selection} onClick={next}>{answers.length === 2 ? "طعم من را پیدا کن" : "پرسش بعدی"}<AvIcon name="arrow" size={17} /></button>
              {answers.length > 0 && <button type="button" className="taste-reset" onClick={() => { setAnswers((a) => a.slice(0, -1)); setSelection(""); focusTitle(); }}>پرسش قبلی</button>}
            </div>
          </>
        )}
        <p className="taste-disclaimer">این یک راهنمای سلیقه است، نه آزمایش کیفیت یا توصیهٔ درمانی.</p>
      </div>
    </div>
  );
}
