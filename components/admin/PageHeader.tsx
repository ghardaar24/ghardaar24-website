import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Shared header for every admin + staff page: section eyebrow, title,
// one-line description, optional back link and actions on the right.
export default function PageHeader({
  eyebrow,
  title,
  description,
  back,
  actions,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <header className="bo-head">
      {back && (
        <Link href={back.href} className="bo-back">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          {back.label}
        </Link>
      )}
      <div className="bo-head-row">
        <div className="bo-head-copy">
          <p className="bo-eyebrow">{eyebrow}</p>
          <h1 className="bo-title">{title}</h1>
          {description && <p className="bo-desc">{description}</p>}
        </div>
        {actions && <div className="bo-actions">{actions}</div>}
      </div>
    </header>
  );
}
