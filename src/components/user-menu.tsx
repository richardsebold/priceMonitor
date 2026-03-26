import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BadgeCheckIcon,
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
  PlaneTakeoff,
} from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { redirect } from "next/dist/client/components/navigation";
import { headers } from "next/dist/server/request/headers";
import { auth } from "@/lib/auth";
import { ButtonSignOut } from "./button-signout";
import Link from "next/link";
export async function UserMenu() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }
  

  const userImage = session.user.image;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer" asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar>
            <AvatarImage src={userImage || "https://github.com/shadcn.png"} alt="shadcn" />
            <AvatarBadge className="bg-green-500 dark:bg-green-700" />
            <AvatarFallback>LR</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <BadgeCheckIcon />
            <Link href="/conta">
              Minha Conta
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <PlaneTakeoff />
            <Link href="/planos">
              Planos
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <CreditCardIcon />
            Pagamentos
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <BellIcon />
            <Link href="/alertas">Alertas</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOutIcon />
          <ButtonSignOut />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
