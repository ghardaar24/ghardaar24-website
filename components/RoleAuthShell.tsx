import Link from "next/link";
import { ShieldCheck, Briefcase } from "lucide-react";
import AuthShell from "@/components/AuthShell";

// Admin and staff sign-in share one design; only the wording and the
// role pill change, so it's always clear which door you're at.
const ROLES = {
  admin: {
    eyebrow: "Admin panel · Ghardaar24",
    line1: "The whole back office,",
    line2: "in one place.",
    sub: "Listings, approvals, CRM, staff, tasks and revenue. For Ghardaar24 administrators only.",
    pill: "Admin",
    image: "/adminauth.png",
    Icon: ShieldCheck,
    other: { href: "/staff/login", label: "Staff member? Sign in to the staff portal" },
  },
  staff: {
    eyebrow: "Staff portal · Ghardaar24",
    line1: "Your clients, tasks",
    line2: "and site visits.",
    sub: "Update your CRM sheets, record site visits and keep on top of the tasks assigned to you.",
    pill: "Staff",
    image: "/staffauth.png",
    Icon: Briefcase,
    other: { href: "/admin/login", label: "Administrator? Sign in to the admin panel" },
  },
} as const;

export default function RoleAuthShell({
  role,
  showSwitch = true,
  children,
}: {
  role: keyof typeof ROLES;
  showSwitch?: boolean;
  children: React.ReactNode;
}) {
  const r = ROLES[role];
  return (
    <AuthShell eyebrow={r.eyebrow} line1={r.line1} line2={r.line2} sub={r.sub} image={r.image}>
      <div className={`ax-role-page ax-role-page--${role}`}>
        <p className="ax-role-pill">
          <r.Icon className="w-4 h-4" aria-hidden="true" />
          {r.pill}
        </p>
        {children}
        {showSwitch && (
          <Link href={r.other.href} className="ax-role-switch">
            {r.other.label}
          </Link>
        )}
      </div>
    </AuthShell>
  );
}
