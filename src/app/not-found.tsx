import Image from "next/image";
import Link from "next/link";
import { PublicFooter } from "@/components/shared/PublicFooter";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFB] text-[#0E2E33]">
      <header className="border-b border-[#E2ECEE] bg-white">
        <nav
          aria-label="Navegación principal"
          className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/icono.png"
              alt="Logo de Semáforo Vital"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="text-lg font-bold tracking-tight text-[#0E2E33]">
              Semáforo Vital
            </span>
          </Link>
          <Link
            href="/"
            className="border border-[#047270] bg-white px-4 py-2 text-sm font-semibold text-[#047270] transition hover:bg-[#F0F8F7]"
          >
            Volver al inicio
          </Link>
        </nav>
      </header>

      <main className="anim-entrada mx-auto flex flex-1 max-w-3xl flex-col items-start justify-center px-4 py-20 sm:px-6 lg:px-8">
        <p className="border-l-4 border-[#047270] pl-3 text-sm font-bold text-[#047270]">
          Error 404
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0A252A] sm:text-4xl">
          La página que buscas no está disponible
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-[#4C666B]">
          Es posible que la dirección haya cambiado o que el recurso solicitado no exista dentro del sistema de monitoreo sanitario.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/"
            className="anim-interactivo bg-[#047270] px-6 py-3 text-sm font-semibold text-white hover:bg-[#035B59]"
          >
            Ir a la página principal
          </Link>
          <Link
            href="/educacion"
            className="anim-interactivo border border-[#186A6B] bg-white px-6 py-3 text-sm font-semibold text-[#047270] hover:bg-[#F0F8F7]"
          >
            Consultar guía de saneamiento
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
