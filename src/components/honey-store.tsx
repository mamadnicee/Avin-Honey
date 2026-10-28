"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AvIcon } from "@/components/av-icon";
import { FeaturedShowcase } from "@/components/featured-showcase";
import { GiftStudio } from "@/components/gift-studio";
import { HoneycombGallery } from "@/components/honeycomb-gallery";
import { HiveJourney } from "@/components/hive-journey";
import { NatureOrbit } from "@/components/nature-orbit";
import { StoreFooter, StoreHeader } from "@/components/site-chrome";
import { TasteFinder } from "@/components/taste-finder";
import type { StoreProduct, StoreVariant } from "@/lib/catalog";
import { PRODUCT_CATEGORIES, SHIPPING_THRESHOLD, STANDARD_SHIPPING } from "@/lib/catalog";
import { JOURNAL_ARTICLES } from "@/lib/journal";

type IconName = "bag" | "heart" | "close" | "plus" | "minus" | "trash";

function Icon({ name, size = 21 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "bag" && (
        <>
          <path d="M5 8h14l1 12H4L5 8Z" />
          <path d="M9 9V6a3 3 0 0 1 6 0v3" />
        </>
      )}
      {name === "heart" && (
        <path d="M20.8 8.7c0 5.1-8.8 10.3-8.8 10.3S3.2 13.8 3.2 8.7A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.5Z" />
      )}
      {name === "close" && <path d="m18 6-12 12M6 6l12 12" />}
      {name === "plus" && <path d="M12 5v14M5 12h14" />}
      {name === "minus" && <path d="M5 12h14" />}
      {name === "trash" && (
        <path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" />
      )}
    </svg>
  );
}

type CartLine = {
  sku: string;
  slug: string;
  name: string;
  image: string;
  weight: string;
  price: number;
  quantity: number;
};

type OrderConfirmation = {
  orderNumber: string;
  subtotal: number;
  shipping: number;
  total: number;
};

const formatMoney = (n: number) => new Intl.NumberFormat("fa-IR").format(n);
const storageKey = "mehrshahd-cart-v1";

const LEAVES = [
  { right: "6%", delay: "-4s", duration: "12s", size: 17 },
  { right: "22%", delay: "-8s", duration: "14s", size: 12 },
  { right: "39%", delay: "-2s", duration: "13s", size: 14 },
  { right: "62%", delay: "-6s", duration: "15s", size: 15 },
  { right: "79%", delay: "-10s", duration: "12s", size: 11 },
  { right: "94%", delay: "-3s", duration: "16s", size: 16 },
];

function LeafFall() {
  return (
    <span className="leaf-layer" aria-hidden="true">
      {LEAVES.map((leaf, i) => (
        <i
          key={i}
          style={{
            right: leaf.right,
            animationDelay: leaf.delay,
            animationDuration: leaf.duration,
            width: leaf.size,
            height: leaf.size,
          }}
        />
      ))}
    </span>
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;

    if (
      !node ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      node.getBoundingClientRect().top < window.innerHeight
    ) {
      return;
    }

    node.dataset.reveal = "waiting";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.dataset.reveal = "visible";
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function JarPlaceholder() {
  return (
    <article className="product-card placeholder-card" aria-label="جایگاه عسل فصل">
      <div className="placeholder-visual">
        <span className="placeholder-shimmer" />
        <AvIcon name="jar" size={56} />
        <span className="placeholder-hex" aria-hidden="true">
          ⬡
        </span>
      </div>
      <div className="placeholder-copy">
        <span className="empty-product-status">برداشت‌های تازه</span>
        <b>عسل طبیعی آوین</b>
        <span>محصولات به محض آماده‌سازی در این ویترین قرار خواهند گرفت.</span>
      </div>
    </article>
  );
}

function ProductCard({
  product,
  selectedSku,
  favorite,
  onVariant,
  onFavorite,
  onAdd,
}: {
  product: StoreProduct;
  selectedSku: string;
  favorite: boolean;
  onVariant: (sku: string) => void;
  onFavorite: () => void;
  onAdd: (p: StoreProduct, v: StoreVariant) => void;
}) {
  const variant =
    product.variants.find((v) => v.sku === selectedSku) ?? product.variants[0];

  if (!variant) return null;

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 600px) 50vw, (max-width: 1100px) 33vw, 25vw"
            className="product-image"
          />
        ) : (
          <span className="product-image-fallback">
            <AvIcon name="jar" size={48} />
          </span>
        )}

        {product.badge && <span className="product-badge">{product.badge}</span>}

        <button
          className={`favorite-button${favorite ? " is-favorite" : ""}`}
          type="button"
          onClick={onFavorite}
          aria-label={
            favorite
              ? `حذف ${product.name} از علاقه‌مندی‌ها`
              : `افزودن ${product.name} به علاقه‌مندی‌ها`
          }
          aria-pressed={favorite}
        >
          <Icon name="heart" size={18} />
        </button>
      </div>

      <div className="product-info">
        <span className="product-kicker">
          {product.category}
          {product.origin ? ` · ${product.origin}` : ""}
        </span>

        <h3>
          <Link className="product-title-link" href={`/product/${product.slug}`}>
            {product.name}
          </Link>
        </h3>

        {product.subtitle && <p className="product-subtitle">{product.subtitle}</p>}

        <div className="weight-options" aria-label={`انتخاب وزن ${product.name}`}>
          {product.variants.map((v) => (
            <button
              type="button"
              key={v.sku}
              className={`weight-option${v.sku === variant.sku ? " is-selected" : ""}`}
              onClick={() => onVariant(v.sku)}
              aria-pressed={v.sku === variant.sku}
            >
              {v.weight}
            </button>
          ))}
        </div>

        {product.description && (
          <details className="product-details">
            <summary>دربارهٔ این برداشت</summary>
            <p>{product.description}</p>
            {product.harvestSeason && <small>{product.harvestSeason}</small>}
          </details>
        )}

        <div className="product-purchase-row">
          <span className="current-price">
            {variant.price === null ? (
              <span className="current-price price-pending">قیمت به‌زودی</span>
            ) : (
              <span className="current-price">
                {formatMoney(variant.price)} <small>تومان</small>
              </span>
            )}
          </span>

          {variant.stock > 0 ? (
            <button
              className="add-button"
              type="button"
              disabled={variant.price === null}
              onClick={() => {
                if (variant.price !== null) onAdd(product, variant);
              }}
              aria-label={
                variant.price === null
                  ? `قیمت ${product.name} ${variant.weight} هنوز تعیین نشده است`
                  : `افزودن ${product.name} ${variant.weight} به سبد`
              }
            >
              <Icon name="plus" size={18} />
            </button>
          ) : (
            <span className="out-of-stock">ناموجود</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function HoneyStore({
  products,
  trustLogos,
  initialCategory = "همه",
  permitCode = "",
}: {
  products: StoreProduct[];
  trustLogos: string[];
  initialCategory?: string;
  permitCode?: string;
}) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const [sending, setSending] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [toast, setToast] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const drawer = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const backTopRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const parsed: unknown = JSON.parse(window.localStorage.getItem(storageKey) || "[]");

      if (Array.isArray(parsed)) {
        setCart(
          parsed.filter(
            (line): line is CartLine =>
              line &&
              typeof line.sku === "string" &&
              typeof line.slug === "string" &&
              typeof line.name === "string" &&
              typeof line.image === "string" &&
              typeof line.weight === "string" &&
              typeof line.price === "number" &&
              Number.isInteger(line.quantity) &&
              line.quantity > 0 &&
              line.quantity <= 10,
          ),
        );
      }
    } catch {
      /* A blocked storage API must not prevent shopping. */
    }

    setCartReady(true);

    return () => clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    if (cartReady) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(cart));
      } catch {
        /* The cart still works in memory. */
      }
    }
  }, [cart, cartReady]);

  // Scroll feedback is written straight to the DOM. Keeping it out of React state
  // prevents the whole page (gallery, story, product grid) re-rendering per frame.
  useEffect(() => {
    let frame = 0;
    let shown = false;

    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const value = max > 0 ? Math.min(100, (scrollY / max) * 100) : 0;

      if (progressRef.current) progressRef.current.style.width = `${value}%`;

      const next = scrollY > 500;

      if (next !== shown && backTopRef.current) {
        shown = next;
        backTopRef.current.classList.toggle("back-top-visible", next);
        backTopRef.current.tabIndex = next ? 0 : -1;
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useEffect(() => {
    if (!cartOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const focusTimer = setTimeout(
      () => drawer.current?.querySelector<HTMLButtonElement>(".drawer-close")?.focus(),
      60,
    );

    const keys = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCartOpen(false);
      if (event.key !== "Tab") return;

      const controls = drawer.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled),a[href],input,textarea,select',
      );
      const visible = Array.from(controls || []).filter(
        (el) => el.offsetParent !== null,
      );
      const first = visible[0];
      const last = visible[visible.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", keys);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keys);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [cartOpen]);

  const categoryCounts = PRODUCT_CATEGORIES.map((name) => ({
    name,
    count: products.filter((p) => p.category === name).length,
  }));

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fa-IR");
    const result = products.filter(
      (p) =>
        (category === "همه" || p.category === category) &&
        (!onlyFavorites || favorites.includes(p.slug)) &&
        (!query ||
          `${p.name} ${p.subtitle} ${p.origin}`
            .toLocaleLowerCase("fa-IR")
            .includes(query)),
    );

    if (sort !== "default") {
      result.sort(
        (a, b) =>
          ((a.variants[0]?.price || 0) - (b.variants[0]?.price || 0)) *
          (sort === "low" ? 1 : -1),
      );
    }

    return result;
  }, [products, category, search, onlyFavorites, favorites, sort]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;

  function announce(text: string) {
    clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = setTimeout(() => setToast(""), 2800);
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  }

  function chooseCategory(next: string) {
    setCategory(next);
    setSearch("");
    setOnlyFavorites(false);
    scrollTo("products");
  }

  function addToCart(product: StoreProduct, variant: StoreVariant) {
    if (typeof variant.price !== "number") {
      announce("قیمت این محصول هنوز تعیین نشده است.");
      return;
    }

    const existing = cart.find((item) => item.sku === variant.sku);
    const max = Math.min(10, variant.stock);

    if ((existing?.quantity || 0) >= max) {
      announce("به سقف موجودی این وزن رسیده‌ای.");
      return;
    }

    setCart((current) =>
      existing
        ? current.map((item) =>
            item.sku === variant.sku
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [
            ...current,
            {
              sku: variant.sku,
              slug: product.slug,
              name: product.name,
              image: product.image,
              weight: variant.weight,
              price: variant.price,
              quantity: 1,
            },
          ],
    );

    announce(`${product.name} به سبد اضافه شد.`);
  }

  function changeQuantity(sku: string, delta: number) {
    const variant = products.flatMap((p) => p.variants).find((v) => v.sku === sku);

    setCart((current) =>
      current.map((item) =>
        item.sku === sku
          ? {
              ...item,
              quantity: Math.max(
                1,
                Math.min(variant?.stock || 10, 10, item.quantity + delta),
              ),
            }
          : item,
      ),
    );
  }

  function openCart() {
    setConfirmation(null);
    setCheckoutOpen(false);
    setOrderError("");
    setCartOpen(true);
  }

  function toggleFavorite(slug: string) {
    const has = favorites.includes(slug);

    setFavorites((current) =>
      has ? current.filter((s) => s !== slug) : [...current, slug],
    );

    announce(
      has ? "از دلخواه‌ها برداشته شد." : "به دلخواه‌ها اضافه شد.",
    );
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setOrderError("");

    const data = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: data.get("customerName"),
          phone: data.get("phone"),
          province: data.get("province"),
          city: data.get("city"),
          address: data.get("address"),
          postalCode: data.get("postalCode"),
          customerNote: data.get("customerNote"),
          items: cart.map((item) => ({
            sku: item.sku,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setOrderError(
          typeof result.error === "string" ? result.error : "ثبت سفارش انجام نشد.",
        );
        return;
      }

      setConfirmation({
        orderNumber: result.orderNumber,
        subtotal: result.subtotal,
        shipping: result.shipping,
        total: result.total,
      });
      setCart([]);
      setCheckoutOpen(false);
    } catch {
      setOrderError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="storefront" dir="rtl">
      <a className="skip-link" href="#main-content">
        رفتن به محتوای اصلی
      </a>

      <div className="honey-progress" aria-hidden="true">
        <span ref={progressRef}>
          <i />
        </span>
      </div>

      <StoreHeader home count={count} onCart={openCart} />

      <main id="main-content">
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero-halo" aria-hidden="true" />
          <div className="hero-comb" aria-hidden="true" />
          <LeafFall />

          <div className="page-width hero-layout">
            <div className="hero-content">
              <p className="hero-eyebrow">
                <span /> عسل طبیعی، از دلِ طبیعت
              </p>
              <h1 className="display" id="hero-title">
                یک قاشق <em>طبیعت،</em>
                <br />
                یک دنیا حالِ خوب.
              </h1>
              <p className="hero-description">
                از عطر گل‌های دشت تا آرامش کوهستان؛ یک انتخاب ساده برای شیرین‌تر
                شدن لحظه‌ها.
              </p>
              <div className="hero-actions">
                <a className="button button-honey" href="#products">
                  دیدن فروشگاه <AvIcon name="arrow" size={18} />
                </a>
                <a className="button button-ghost" href="#taste-guide">
                  طعم من چیه؟ <AvIcon name="compass" size={18} />
                </a>
              </div>
              <div className="hero-chips" aria-label="میان‌برهای طعم">
                <button
                  className="hero-chip"
                  type="button"
                  onClick={() => chooseCategory("تک‌گل")}
                >
                  <AvIcon name="flower" size={15} /> دنیای تک‌گل
                </button>
                <button
                  className="hero-chip"
                  type="button"
                  onClick={() => chooseCategory("چندگیاه")}
                >
                  <AvIcon name="leaf" size={15} /> ترکیب دشت
                </button>
                <button
                  className="hero-chip"
                  type="button"
                  onClick={() => scrollTo("featured")}
                >
                  <AvIcon name="sparkle" size={15} /> انتخاب‌های ویژه
                </button>
              </div>
            </div>

            <div className="hero-nature">
              <span className="hero-art-label">SMALL WINGS, SWEET STORIES</span>
              <NatureOrbit />
            </div>
          </div>

          <div className="hero-footnote">
            <span>از اصفهان، برای لحظه‌های شیرینِ تو</span>
            <a href="#featured" aria-label="دیدن بخش بعد">
              <span className="scroll-line" /> کمی پایین‌تر، کمی شیرین‌تر{" "}
              <AvIcon name="drop" size={14} />
            </a>
          </div>
        </section>

        <section className="promise-section" aria-label="راهنمای خرید آوین">
          <div className="page-width promise-grid">
            {[
              {
                icon: "compass" as const,
                title: "خاستگاهِ روشن",
                text: "مشخصات هر برداشت، کنار محصول",
              },
              {
                icon: "jar" as const,
                title: "به اندازهٔ تو",
                text: "انتخاب وزن، قیمت و موجودی مشخص",
              },
              {
                icon: "shield" as const,
                title: "با دقت تا خانه",
                text: "بسته‌بندی محافظ برای شیشه‌ها",
              },
              {
                icon: "phone" as const,
                title: "بی‌واسطه بپرس",
                text: "پشتیبانی مستقیم از اصفهان",
              },
            ].map((item) => (
              <div className="promise-item" key={item.title}>
                <span>
                  <AvIcon name={item.icon} size={22} />
                </span>
                <div>
                  <b>{item.title}</b>
                  <small>{item.text}</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        <FeaturedShowcase products={products} />

        <section
          className="products-section section-padding"
          id="products"
          aria-labelledby="products-title"
        >
          <div className="page-width">
            <Reveal className="section-heading">
              <p className="eyebrow">
                <AvIcon name="jar" size={16} /> ویترین آوین
              </p>
              <h2 className="display" id="products-title">
                هر شیشه، <em>یک داستان.</em>
              </h2>
              <p className="section-description">
                از خاستگاه تا وزن، از رایحه تا قیمت؛
                <br />
                همه‌چیز را ببین، بعد انتخاب کن.
              </p>
            </Reveal>

            <div className="product-toolbar">
              <div
                className="category-tabs"
                role="group"
                aria-label="فیلتر دسته‌بندی"
              >
                {["همه", ...PRODUCT_CATEGORIES].map((name) => (
                  <button
                    type="button"
                    key={name}
                    aria-pressed={category === name}
                    className={`category-tab${category === name ? " is-active" : ""}`}
                    onClick={() => setCategory(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <div className="catalog-tools">
                <label className="search-box">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    aria-hidden="true"
                  >
                    <circle cx="10" cy="10" r="6" />
                    <path d="m15 15 6 6" />
                  </svg>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="دنبال چه طعمی هستی؟"
                    aria-label="جست‌وجوی محصولات"
                  />
                </label>

                {products.length > 0 && (
                  <>
                    <select
                      className="catalog-sort"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      aria-label="مرتب‌سازی محصولات"
                    >
                      <option value="default">پیشنهاد آوین</option>
                      <option value="low">قیمت کمتر</option>
                      <option value="high">قیمت بیشتر</option>
                    </select>
                    <button
                      className={`catalog-favorites${onlyFavorites ? " active" : ""}`}
                      type="button"
                      aria-label="نمایش علاقه‌مندی‌ها"
                      aria-pressed={onlyFavorites}
                      onClick={() => setOnlyFavorites(!onlyFavorites)}
                    >
                      <Icon name="heart" size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {!products.length ? (
              <>
                <div className="product-grid placeholder-grid">
                  {[0, 1, 2].map((i) => (
                    <Reveal key={i} delay={i * 70}>
                      <JarPlaceholder />
                    </Reveal>
                  ))}
                </div>
                <p className="catalog-empty-note">
                  <span /> ویترین به‌زودی با برداشت‌های تازهٔ عسل آوین هانی تکمیل
                  خواهد شد.
                </p>
              </>
            ) : visibleProducts.length ? (
              <div className="product-grid">
                {visibleProducts.map((product, i) => (
                  <Reveal key={product.slug} delay={(i % 4) * 60}>
                    <ProductCard
                      product={product}
                      selectedSku={selected[product.slug] || ""}
                      favorite={favorites.includes(product.slug)}
                      onVariant={(sku) =>
                        setSelected((s) => ({ ...s, [product.slug]: sku }))
                      }
                      onFavorite={() => toggleFavorite(product.slug)}
                      onAdd={addToCart}
                    />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="empty-search">
                <AvIcon name="compass" size={28} />
                <strong>در این مسیر، محصولی پیدا نشد.</strong>
                <button
                  onClick={() => {
                    setCategory("همه");
                    setSearch("");
                    setOnlyFavorites(false);
                  }}
                  type="button"
                >
                  دیدن همهٔ محصولات
                </button>
              </div>
            )}
          </div>
        </section>

        <section
          className="taste-section section-padding"
          id="taste-guide"
          aria-label="راهنمای تعاملی طعم"
        >
          <div className="page-width">
            <Reveal>
              <TasteFinder categories={categoryCounts} onChoose={chooseCategory} />
            </Reveal>
            <Link className="taste-page-link" href="/discover">
              کشف طعم در یک صفحهٔ اختصاصی <AvIcon name="arrow" size={16} />
            </Link>
          </div>
        </section>

        <section className="story-section section-padding" id="story">
          <LeafFall />
          <div className="page-width story-layout">
            <Reveal className="story-visual-wrap">
              <div className="story-visual">
                <Image
                  src="/images/hero-honey.jpg"
                  alt="ریزش عسل کهربایی در یک شیشه، در کنار شاخه‌های گیاه"
                  fill
                  sizes="(max-width: 720px) 85vw, 44vw"
                />
              </div>
              <span className="story-stamp display">
                هر گل،
                <br />
                یک داستان
              </span>
              <span className="story-photo-caption">یک لحظهٔ آرام از دنیای عسل</span>
            </Reveal>

            <div className="story-copy">
              <Reveal>
                <p className="eyebrow">
                  <AvIcon name="leaf" size={16} /> قصهٔ یک قاشق عسل
                </p>
                <h2 className="display">
                  سادگیِ خوب،
                  <br />
                  <em>از کندو</em> شروع می‌شود.
                </h2>
                <p className="story-body">
                  عسل فقط یک رنگ و یک طعم ندارد. هر منطقه و هر فصل، شخصیت خودش
                  را در یک شیشه جا می‌دهد. آوین هانی جایی است برای آشنایی با این
                  تفاوت‌ها؛ بی‌ادعای اضافه، با اطلاعات روشن و فرصتی برای انتخاب
                  با سلیقهٔ خودت.
                </p>
                <ul className="story-values">
                  <li>
                    <AvIcon name="compass" size={18} />
                    <span>
                      <b>اول شناخت</b> خاستگاه و مشخصات هر برداشت را بخوان.
                    </span>
                  </li>
                  <li>
                    <AvIcon name="drop" size={18} />
                    <span>
                      <b>بعد تجربه</b> از وزن کوچک‌تر، با یک طعم تازه آشنا شو.
                    </span>
                  </li>
                </ul>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
    );
  }
