import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-[#fcfaf4] px-6 py-16 text-center">
      <div className="max-w-md">
        <span className="inline-flex"><BrandMark size={62} /></span>
        <p className="mt-6 text-xs tracking-[.25em] text-[#b59b48]">۴۰۴ · یک مسیر تازه</p>
        <h1 className="display mt-5 text-4xl leading-relaxed text-[#214c33]">از مسیر کندو دور شدیم.</h1>
        <p className="mt-4 text-sm leading-8 text-[#7b8b70]">این صفحه پیدا نشد؛ اما هنوز طعم‌های زیادی برای کشف کردن هست.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><Link className="button button-green" href="/">بازگشت به آوین</Link><Link className="button button-ghost" href="/discover">کشف یک طعم تازه</Link></div>
      </div>
    </main>
  );
}
