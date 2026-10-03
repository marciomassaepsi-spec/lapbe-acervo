import Image from "next/image";
import Link from "next/link";

/** Logo no topo das páginas no celular (onde a barra lateral some). */
export function MarcaCelular() {
  return (
    <Link href="/" className="mob-brand">
      <Image src="/logo.webp" alt="" width={44} height={30} />
      <b>LAPBE</b>
    </Link>
  );
}
