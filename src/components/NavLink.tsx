"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({ href, children, exato = false }: { href: string; children: ReactNode; exato?: boolean }) {
  const caminho = usePathname();
  const ativo = href === "/" || exato ? caminho === href : caminho === href || caminho.startsWith(href + "/");
  return (
    <Link href={href} aria-current={ativo ? "page" : undefined}>
      {children}
    </Link>
  );
}
