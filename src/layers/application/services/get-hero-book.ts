import type { HeroBook } from "@/layers/domain/books/hero.book";

export function getHeroBook(): HeroBook {
  return {
    title: "Muy pronto",
    subtitle: "Estamos preparando la experiencia.",
  };
}
