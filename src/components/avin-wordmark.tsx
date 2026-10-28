import Image from "next/image";

type Props = { large?: boolean; tone?: "dark" | "light" };

export function AvinWordmark({ large = false, tone = "dark" }: Props) {
  const src = tone === "light" ? "/brand/avin-a-mark-white.png" : "/brand/avin-a-mark.png";
  return (
    <span className={`avin-wordmark avin-wordmark-${tone}${large ? " avin-wordmark-large" : ""}`} dir="ltr">
      <Image src={src} alt="" width={large ? 32 : 20} height={large ? 32 : 20} priority={!large} unoptimized />
      <span>AVIN HONEY</span>
    </span>
  );
}
