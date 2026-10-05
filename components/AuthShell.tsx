import Link from "next/link";
import Image from "next/image";

// Split-screen sign-in shell: dusk panel with headline + art on the left,
// the form on the right. Used by the public, admin and staff auth pages.
export default function AuthShell({
  eyebrow,
  line1,
  line2,
  sub,
  homeHref = "/",
  image = "/auth.png",
  children,
}: {
  eyebrow: string;
  line1: string;
  line2: string;
  sub: string;
  homeHref?: string;
  /** 1536×1024 transparent PNG shown at the bottom of the panel */
  image?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ax-shell">
      <aside className="ax-art">
        <Link href={homeHref} className="ax-logo" aria-label="Ghardaar24 home">
          <Image src="/logo3.png" alt="Ghardaar24" width={180} height={56} priority />
        </Link>

        <div className="ax-art-copy">
          <p className="hero-v2-eyebrow">{eyebrow}</p>
          <p className="ax-art-heading">
            <span>{line1}</span>
            <em>{line2}</em>
          </p>
          <p className="ax-art-sub">{sub}</p>
        </div>

        <Image
          src={image}
          alt=""
          width={1536}
          height={1024}
          sizes="45vw"
          className="ax-art-img"
          priority
        />
      </aside>

      <div className="ax-main">{children}</div>
    </div>
  );
}
