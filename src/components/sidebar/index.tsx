import Link from "next/link";
import { Button } from "../ui/button";
import { Sheet, SheetTrigger, SheetContent } from "../ui/sheet";
import {
  BadgeQuestionMark,
  Bell,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Package,
  PackageSearch,
  PanelBottom,
  Settings,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { UserMenu } from "../user-menu";
import { ModeToggle } from "../theme-toogle";



export default function Sidebar() {
  return (
    <div className="flex w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 w-14 border-r-2 border-gray-900 hidden sm:flex flex-col">
        <nav className="flex flex-col items-center gap-4 px-2 mt-10">
          <TooltipProvider>
            <div>
              <Link
                href="/dashboard"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                prefetch={false}
              >
                <DollarSign className="h-5 w-5 transition-all" />
                <span className="sr-only">Logo Price Tracker</span>
              </Link>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-white"
                  prefetch={false}
                >
                  <LayoutDashboard className="h-5 w-5 transition-all" />
                  <span className="sr-only">Dashboard</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Dashboard</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/produtos"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-white"
                  prefetch={false}
                >
                  <PackageSearch className="h-5 w-5 transition-all" />
                  <span className="sr-only">Produtos Rastreados</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Produtos Rastreados</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/alertas"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-white"
                  prefetch={false}
                >
                  <Bell className="h-5 w-5 transition-all" />
                  <span className="sr-only">Alertas</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Alertas</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>

        <nav className="mt-auto flex flex-col items-center gap-4 px-2 mb-10">
          <ModeToggle />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/settings"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-white"
                  prefetch={false}
                >
                  <Settings className="h-5 w-5 transition-all" />
                  <span className="sr-only">Configurações</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Configurações</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/help"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-white"
                  prefetch={false}
                >
                  <BadgeQuestionMark className="h-5 w-5 transition-all" />
                  <span className="sr-only">Ajuda</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Ajuda</TooltipContent>
            </Tooltip>

            {/* <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-red-400"
                  prefetch={false}
                >
                  <LogOut className="h-5 w-5 transition-all" />
                  <span className="sr-only">Sair</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Sair</TooltipContent>
            </Tooltip> */}

            <UserMenu />
          </TooltipProvider>
        </nav>
      </aside>

      <div className="sm:hidden flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center px-4 border-b bg-background gap-4 sm:static sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelBottom className="h-5 w-5" />
                <span className="sr-only"> Abrir / fechar menu </span>
              </Button>
            </SheetTrigger>

            <SheetContent className="sm:max-w-x p-3">
              <nav className="grid gap-6 text-m font-medium">
                <Link
                  href="/"
                  className="flex h-10 w-10 rounded-full bg-primary text-lg items-center justify-center text-primary-foreground md:text-base gap-2"
                  prefetch={false}
                >
                  <Package className="h-5 w-5 transition-all" />
                  <span className="sr-only">Logo</span>
                </Link>

                <Link
                  href="/"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  prefetch={false}
                >
                  <LayoutDashboard className="h-5 w-5 transition-all" />
                  <span className="">Dashboard</span>
                </Link>

                <Link
                  href="/"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  prefetch={false}
                >
                  <PackageSearch className="h-5 w-5 transition-all" />
                  <span className="">Produtos Rastreados</span>
                </Link>

                <Link
                  href="/"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  prefetch={false}
                >
                  <Bell className="h-5 w-5 transition-all" />
                  <span className="">Alertas</span>
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  prefetch={false}
                >
                  <Settings className="h-5 w-5 transition-all" />
                  <span className="">Configurações</span>
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  prefetch={false}
                >
                  <BadgeQuestionMark className="h-5 w-5 transition-all" />
                  <span className="">Ajuda</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  prefetch={false}
                >
                  <LogOut className="h-5 w-5 transition-all" />
                  <span className="">Sair</span>
                </Link>
              </nav>
            </SheetContent>

            <ModeToggle />
          </Sheet>
          <h2>Menu</h2>
        </header>
      </div>
    </div>
  );
}
