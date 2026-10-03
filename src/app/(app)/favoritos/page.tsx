import type { Metadata } from "next";
import { chaveFavorito, LinhaItem, Vazio } from "@/components/Itens";
import { MarcaCelular } from "@/components/MarcaCelular";
import { biblioteca, listarEixos, listarEncontros, meuProgresso, meusFavoritos } from "@/lib/dados";
import type { ItemBiblioteca } from "@/lib/tipos";

export const metadata: Metadata = { title: "Favoritos" };

export default async function Favoritos() {
  const [favoritos, itens, encontros, eixos, progresso] = await Promise.all([
    meusFavoritos(),
    biblioteca(),
    listarEncontros(),
    listarEixos(),
    meuProgresso(),
  ]);
  const concluidos = new Set(progresso.filter((p) => p.concluido).map((p) => `${p.item_tipo}:${p.item_id}`));

  // Na ordem em que foram favoritados. Encontros sem gravação também podem ser favoritos.
  const lista: ItemBiblioteca[] = favoritos
    .map((f): ItemBiblioteca | undefined => {
      const achado = itens.find((i) => chaveFavorito(i) === `${f.item_tipo}:${f.item_id}`);
      if (achado) return achado;
      if (f.item_tipo === "encontro") {
        const e = encontros.find((x) => x.id === f.item_id && x.publicado);
        return e ? { tipo: "aula", encontro: e, data: e.data } : undefined;
      }
      return undefined;
    })
    .filter((i) => i !== undefined);

  return (
    <div className="screen">
      <MarcaCelular />
      <header className="page-head">
        <span className="eyebrow">Só seus</span>
        <h1>Favoritos</h1>
        <p>Toque na estrela de qualquer aula ou material para guardar aqui.</p>
      </header>
      {lista.length ? (
        <div className="list">
          {lista.map((item) => (
            <LinhaItem key={chaveFavorito(item)} item={item} eixos={eixos} favorito concluido={concluidos.has(chaveFavorito(item))} />
          ))}
        </div>
      ) : (
        <Vazio titulo="Nenhum favorito ainda">Use a estrela ao lado de cada item da biblioteca.</Vazio>
      )}
    </div>
  );
}
