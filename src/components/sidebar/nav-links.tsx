"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ButtonSignOut } from "../button-signout";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActivePath } from "./nav-items";

export function DesktopNavLinks({ footer = false }: { footer?: boolean }) {
  const pathname = usePathname();

  return NAV_ITEMS.filter((item) => !!item.footer === footer).map(
    ({ href, label, icon: Icon }) => {
      const active = isActivePath(pathname, href);
      return (
        <Tooltip key={href}>
          <TooltipTrigger asChild>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-white",
              )}
              prefetch={false}
            >
              <Icon className="h-5 w-5 transition-all" />
              <span className="sr-only">{label}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      );
    },
  );
}

export function MobileNavLinks() {
  const pathname = usePathname();

  return (
    <>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActivePath(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-4 px-2.5",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            prefetch={false}
          >
            <Icon className="h-5 w-5 transition-all" />
            <span>{label}</span>
          </Link>
        );
      })}

      <ButtonSignOut className="flex cursor-pointer items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
        <LogOut className="h-5 w-5 transition-all" />
        <span>Sair</span>
      </ButtonSignOut>
    </>
  );
}
