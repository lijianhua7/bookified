"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Show, UserButton, SignInButton, useUser } from "@clerk/nextjs";

const navItems = [
  {
    label: "图书馆",
    href: "/",
  },
  {
    label: "添加新书",
    href: "/books/new",
  },
];

export default function NavBar() {
  const pathName = usePathname();
  const { user } = useUser();
  return (
    <header className="w-full fixed z-50 bg-(--bg-primary)">
      <div className="wrapper navbar-height py-4 flex items-center justify-between">
        {/* hero logo */}
        <Link href="/" className="flex gap-0.5 items-center">
          <Image
            src="/assets/logo.png"
            alt="Bookified"
            width={42}
            height={26}
          />
          <span className="logo-text">Bookified</span>
        </Link>
        {/* 导航栏 */}
        <nav className="w-fit flex gap-7.5 items-center">
          {navItems.map(({ label, href }) => {
            const isActive =
              pathName === href || (href !== "/" && pathName.startsWith(href));
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  "nav-link-base",
                  isActive ? "nav-link-active" : "text-black hover:opacity-70",
                )}
              >
                {label}
              </Link>
            );
          })}
          {/* 登录验证 */}
          <div className="flex items-center gap-7.5">
            <Show when="signed-out">
              <SignInButton mode="modal" />
            </Show>
            <Show when="signed-in">
              <div className="nav-user-link">
                <UserButton />
                {user?.firstName && (
                  <Link href="/subscriptions" className="nav-user-name">
                    {user.firstName}
                  </Link>
                )}
              </div>
            </Show>
          </div>
        </nav>
      </div>
    </header>
  );
}
