"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Permission } from "@/lib/permissions";

const LINKS = [
  { href: "/admin/products", label: "Products", permission: "PRODUCTS" },
  { href: "/admin/orders", label: "Orders", permission: "ORDERS" },
  { href: "/admin/categories", label: "Categories", permission: "CATEGORIES" },
  { href: "/admin/admins", label: "Admins", permission: "ADMINS" },
] as const;

function HamburgerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="shrink-0"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function AdminNav({ permissions }: { permissions: Permission[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const links = LINKS.filter((link) => permissions.includes(link.permission));

  function updatePosition() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ top: rect.bottom + 4, left: rect.left });
  }

  function toggle() {
    if (!open) updatePosition();
    setOpen((o) => !o);
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  return (
    <nav>
      <div className="hidden items-center gap-6 font-semibold md:flex">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active
                  ? "underline underline-offset-4"
                  : "text-zinc-500 hover:text-zinc-900"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label="Open navigation menu"
        className="flex items-center justify-center rounded border border-zinc-300 p-2 text-zinc-700 hover:bg-zinc-100 md:hidden"
      >
        <HamburgerIcon />
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: position.top, left: position.left }}
            className="fixed z-30 w-44 rounded border border-zinc-200 bg-white py-1 shadow-lg"
          >
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2 text-sm font-semibold ${
                    active
                      ? "bg-zinc-50 text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>,
          document.body
        )}
    </nav>
  );
}
