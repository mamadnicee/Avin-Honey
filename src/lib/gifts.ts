export const GIFT_OCCASIONS = [
  { id: "personal", label: "برای یک عزیز", icon: "flower" as const, description: "یک هدیهٔ کوچک، یک فکر شیرین؛ برای تشکر، دیدار یا یک مناسبت دوست‌داشتنی." },
  { id: "business", label: "برای یک تیم", icon: "jar" as const, description: "برای همکاران و همراهان کسب‌وکارت؛ دربارهٔ تعداد، بودجه و امکان بسته‌بندی با هم هماهنگ می‌کنیم." },
  { id: "wholesale", label: "برای یک همکاری", icon: "leaf" as const, description: "برای خرید عمده یا پرسیدن از برداشت تازه، از یک گفت‌وگوی کوتاه و شفاف شروع کنیم." },
] as const;

export function giftOccasionLabel(id: string) {
  return GIFT_OCCASIONS.find((item) => item.id === id)?.label || id;
}

export function englishDigits(value: string) {
  return value.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}
