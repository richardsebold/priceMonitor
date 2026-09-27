import {
  BadgeQuestionMark,
  Bell,
  LayoutDashboard,
  PackageSearch,
  PlaneTakeoff,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Fica no rodapé da barra desktop. */
  footer?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/produtos", label: "Produtos Rastreados", icon: PackageSearch },
  { href: "/alertas", label: "Alertas", icon: Bell },
  { href: "/planos", label: "Planos", icon: PlaneTakeoff },
  { href: "/settings", label: "Configurações", icon: Settings, footer: true },
  { href: "/help", label: "Ajuda", icon: BadgeQuestionMark, footer: true },
];

export function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}
