import type { HeroBook } from "@/layers/domain/books/hero.book";

type HeroProps = Pick<HeroBook, "title" | "subtitle">;

export function Hero({ title, subtitle }: HeroProps) {
  return (
    <section className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center shadow-2xl shadow-black/20">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
        Semáforo Vital - preview. asa
      </p>
      <h1 className="mt-5 text-5xl font-bold tracking-tight text-white">{title}</h1>
      {subtitle ? <p className="mt-4 text-lg text-slate-300">{subtitle}</p> : null}
    </section>
  );
}
