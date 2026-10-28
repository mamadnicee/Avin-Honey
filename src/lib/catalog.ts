export type StoreVariant = {
  id?: number;
  sku: string;
  label: string;
  weight: string;
  price: number | null;
  compareAtPrice: number | null;
  stock: number;
};

export type StoreProduct = {
  id?: number;
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  description: string;
  image: string;
  origin: string;
  harvestSeason: string;
  badge: string | null;
  isFeatured: boolean;
  botanicalNote: string;
  variants: StoreVariant[];
};

export const SHIPPING_THRESHOLD = 1_500_000;
export const STANDARD_SHIPPING = 75_000;

export const PRODUCT_CATEGORIES = ["تک‌گل", "چندگیاه", "ویژه"] as const;

// CATALOG_SEED is the editorial catalog content. It deliberately contains no
// prices, no images and no stock numbers: pricing and inventory are entered by
// the shop owner in the admin panel. Every variant starts with price = null, so
// nothing can be purchased before the owner sets a real price.
export const CATALOG_SEED: StoreProduct[] = [
  {
    slug: "sidr-honey",
    name: "عسل سدر (کُنار)",
    subtitle: "برداشت منطقهٔ گرمسیری جنوب",
    category: "ویژه",
    description:
      "عسل تک‌گل برداشت‌شده از شکوفه‌های درخت سدر؛ با رنگ کهربایی و غلظت بالا. ثبت سفارش پس از تعیین قیمت توسط فروشگاه فعال می‌شود.",
    image: "",
    origin: "جنوب ایران",
    harvestSeason: "پاییز",
    badge: null,
    isFeatured: true,
    botanicalNote:
      "سدر (Ziziphus spina-christi) درختی گرمسیری از خانوادهٔ عناب است که در مناطق گرم و خشک جنوب می‌روید. برداشت در پایان فصل گرم، پس از پایان گل‌دهی انجام می‌شود.",
    variants: [
      { sku: "SIDR-450", label: "۴۵۰ گرم", weight: "۴۵۰ گرم", price: null, compareAtPrice: null, stock: 0 },
      { sku: "SIDR-950", label: "۹۵۰ گرم", weight: "۹۵۰ گرم", price: null, compareAtPrice: null, stock: 0 },
    ],
  },
  {
    slug: "astragalus-honey",
    name: "عسل گون (اشبیل)",
    subtitle: "ارتفاعات زاگرس",
    category: "تک‌گل",
    description:
      "عسل روشن و معطر از گل‌های گیاه گون؛ یکی از شناخته‌شده‌ترین عسل‌های تک‌گل ایران با تبلور طبیعی کند.",
    image: "",
    origin: "زاگرس",
    harvestSeason: "اوایل تابستان",
    badge: null,
    isFeatured: true,
    botanicalNote:
      "گون (Astragalus spp.) گیاهی بوته‌ای از تیرهٔ بقولات است که در ارتفاعات زاگرس می‌روید. دورهٔ گل‌دهی کوتاه است و برداشت در تیرگاه انجام می‌شود.",
    variants: [
      { sku: "ASTR-450", label: "۴۵۰ گرم", weight: "۴۵۰ گرم", price: null, compareAtPrice: null, stock: 0 },
      { sku: "ASTR-950", label: "۹۵۰ گرم", weight: "۹۵۰ گرم", price: null, compareAtPrice: null, stock: 0 },
    ],
  },
  {
    slug: "thyme-honey",
    name: "عسل آویشن",
    subtitle: "مراتع کوهستانی",
    category: "تک‌گل",
    description:
      "عسل با عطر گیاهی مشخص از گل‌های آویشن کوهی؛ با ته‌مایهٔ گرم و پس‌مزهٔ ملایم.",
    image: "",
    origin: "کوهستان‌های مرکزی",
    harvestSeason: "تابستان",
    badge: null,
    isFeatured: false,
    botanicalNote:
      "آویشن (Thymus spp.) گیاهی معطر از تیرهٔ نعناییان است. برداشت پس از دورهٔ اصلی گل‌دهی در تابستان انجام می‌شود.",
    variants: [
      { sku: "THYM-450", label: "۴۵۰ گرم", weight: "۴۵۰ گرم", price: null, compareAtPrice: null, stock: 0 },
    ],
  },
  {
    slug: "wildflower-honey",
    name: "عسل چندگیاه",
    subtitle: "ترکیب گل‌های مرتع",
    category: "چندگیاه",
    description:
      "عسل چندگل از شهد گل‌های متنوع مرتع؛ طیف طعمی متعادل و رنگ متغیر در هر برداشت.",
    image: "",
    origin: "مراتع بومی",
    harvestSeason: "بهار و تابستان",
    badge: null,
    isFeatured: false,
    botanicalNote:
      "عسل چندگله حاصل شهد چند گیاه مرتعی هم‌زمانِ گل است؛ ترکیب دقیق آن به منطقه و فصل برداشت بستگی دارد.",
    variants: [
      { sku: "WILD-450", label: "۴۵۰ گرم", weight: "۴۵۰ گرم", price: null, compareAtPrice: null, stock: 0 },
      { sku: "WILD-950", label: "۹۵۰ گرم", weight: "۹۵۰ گرم", price: null, compareAtPrice: null, stock: 0 },
    ],
  },
  {
    slug: "acacia-honey",
    name: "عسل آکاسیا",
    subtitle: "برداشت باغ‌های اقاقیا",
    category: "تک‌گل",
    description:
      "عسل روشن و روان با تبلور بسیار کند؛ مناسب برای کسانی که طعم ملایم ترجیح می‌دهند.",
    image: "",
    origin: "مناطق معتدل",
    harvestSeason: "اواخر بهار",
    badge: null,
    isFeatured: false,
    botanicalNote:
      "آکاسیا (Robinia pseudoacacia) درختی از تیرهٔ بقولات با گل‌های خوشه‌ای سفید است؛ برداشت در پایان دورهٔ گل‌دهی بهاری انجام می‌شود.",
    variants: [
      { sku: "ACAC-450", label: "۴۵۰ گرم", weight: "۴۵۰ گرم", price: null, compareAtPrice: null, stock: 0 },
    ],
  },
  {
    slug: "citrus-honey",
    name: "عسل مرکبات",
    subtitle: "باغ‌های شمال و جنوب",
    category: "تک‌گل",
    description:
      "عسل با رایحهٔ ملایم شکوفهٔ پرتقال و لیمو؛ روشن‌رنگ با بافت نرم.",
    image: "",
    origin: "باغ‌های مرکبات",
    harvestSeason: "بهار",
    badge: null,
    isFeatured: false,
    botanicalNote:
      "مرکبات (Citrus spp.) درختانی همیشه‌سبز هستند که گل‌دهی آن‌ها در اوایل بهار و پیش از برگ‌دهی کامل رخ می‌دهد.",
    variants: [
      { sku: "CITR-450", label: "۴۵۰ گرم", weight: "۴۵۰ گرم", price: null, compareAtPrice: null, stock: 0 },
    ],
  },
  {
    slug: "barberry-honey",
    name: "عسل زرشک",
    subtitle: "برداشت مناطق خشک شرق",
    category: "ویژه",
    description:
      "عسل با ته‌مایهٔ ترش و ملایم از گل‌های زرشک؛ محصولی کم‌یاب با برداشت محدود.",
    image: "",
    origin: "شرق ایران",
    harvestSeason: "بهار",
    badge: "برداشت محدود",
    isFeatured: true,
    botanicalNote:
      "زرشک (Berberis spp.) درختچه‌ای خاردار از تیرهٔ زرشکیان است؛ گل‌دهی در بهار و پیش از رسیدن میوه انجام می‌شود.",
    variants: [
      { sku: "BARB-450", label: "۴۵۰ گرم", weight: "۴۵۰ گرم", price: null, compareAtPrice: null, stock: 0 },
    ],
  },
  {
    slug: "forest-honey",
    name: "عسل جنگل",
    subtitle: "چندگل جنگلی هیرکانی",
    category: "چندگیاه",
    description:
      "عسل تیره و غلیظ از شهد گل‌های جنگلی و شیره‌های گیاهی؛ با طعم عمیق و ماندگار.",
    image: "",
    origin: "جنگل‌های هیرکانی",
    harvestSeason: "تابستان",
    badge: null,
    isFeatured: false,
    botanicalNote:
      "جنگل‌های هیرکانی ترکیب متنوعی از درختان و گیاهان دارند؛ عسل جنگلی حاصل همین تنوع و بخشی از شیرهٔ گیاهی است.",
    variants: [
      { sku: "FORE-450", label: "۴۵۰ گرم", weight: "۴۵۰ گرم", price: null, compareAtPrice: null, stock: 0 },
      { sku: "FORE-950", label: "۹۵۰ گرم", weight: "۹۵۰ گرم", price: null, compareAtPrice: null, stock: 0 },
    ],
  },
];
