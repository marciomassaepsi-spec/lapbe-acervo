"use client";

import { useEffect, useState } from "react";

export function ContagemCodigo({ expiraEm }: { expiraEm: string }) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const resta = Math.max(0, Math.floor((new Date(expiraEm).getTime() - agora) / 1000));
  if (!resta) return <span className="chip" suppressHydrationWarning>expirado</span>;
  return (
    <span className="mono num muted" suppressHydrationWarning>
      expira em {Math.floor(resta / 60)}:{String(resta % 60).padStart(2, "0")}
    </span>
  );
}
