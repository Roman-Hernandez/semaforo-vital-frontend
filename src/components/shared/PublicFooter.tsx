import Image from "next/image";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-[#DCE6EA] bg-[#0E2E33] text-[#E6F0F0]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/icono.png"
                alt="Logo de Semáforo Vital"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="text-base font-bold tracking-tight text-white">
                Semáforo Vital
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-[#B2C8CB]">
              Plataforma de vigilancia epidemiológica y sanitaria para alojamientos temporales en Colombia.
            </p>
          </div>

          <nav aria-label="Explorar plataforma" className="space-y-3">
            <h2 className="text-sm font-semibold text-white">
              Plataforma
            </h2>
            <ul className="space-y-2 text-xs text-[#B2C8CB]">
              <li>
                <Link href="/#inicio" className="transition hover:text-white">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/#albergues" className="transition hover:text-white">
                  Albergues habilitados
                </Link>
              </li>
              <li>
                <Link href="/#mapa" className="transition hover:text-white">
                  Mapa de ubicación
                </Link>
              </li>
              <li>
                <Link href="/#alertas" className="transition hover:text-white">
                  Alertas sanitarias
                </Link>
              </li>
              <li>
                <Link href="/educacion" className="transition hover:text-white">
                  Educación y saneamiento
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Información institucional" className="space-y-3">
            <h2 className="text-sm font-semibold text-white">
              Institucional
            </h2>
            <ul className="space-y-2 text-xs text-[#B2C8CB]">
              <li>
                <Link href="/quienes-somos" className="transition hover:text-white">
                  Quiénes somos
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="transition hover:text-white">
                  Contacto y canales de atención
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:text-white">
                  Acceso para administradores
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Marco legal y términos" className="space-y-3">
            <h2 className="text-sm font-semibold text-white">
              Marco legal
            </h2>
            <ul className="space-y-2 text-xs text-[#B2C8CB]">
              <li>
                <Link
                  href="/marco-legal#terminos-uso"
                  className="transition hover:text-white"
                >
                  Términos de uso del sistema
                </Link>
              </li>
              <li>
                <Link
                  href="/marco-legal#tratamiento-datos"
                  className="transition hover:text-white"
                >
                  Implicaciones legales y tratamiento de datos
                </Link>
              </li>
              <li>
                <Link
                  href="/marco-legal#normatividad"
                  className="transition hover:text-white"
                >
                  Ley 1581 de 2012 y Ley 1523 de 2012
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-[#1E474E] pt-6 text-xs text-[#8CA8AC] sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} Semáforo Vital — CIAF. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap gap-5">
            <Link href="/quienes-somos" className="hover:text-white">
              Quiénes somos
            </Link>
            <Link href="/marco-legal" className="hover:text-white">
              Términos e implicaciones legales
            </Link>
            <Link href="/contacto" className="hover:text-white">
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
