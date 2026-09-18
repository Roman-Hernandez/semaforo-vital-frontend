import { Hero } from "@/layers/presentation/components/hero";
import { getHeroBook } from "@/layers/application/services/get-hero-book";

export function HomePage() {
  const heroBook = getHeroBook();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16">
      <Hero title={heroBook.title} subtitle={heroBook.subtitle} />
    </main>
  );
}
