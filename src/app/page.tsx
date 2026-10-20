
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#F5FAFA] text-[#183238]">
      <header className="flex items-center justify-between border-b border-[#DCEAEA] bg-white px-6 py-5 md:px-12">
        <Link href="/" className="text-xl font-bold text-[#087F8C]">
          Semáforo Vital
        </Link>

        <Link
          href="/login"
          className="rounded-xl bg-[#00AEBB] px-5 py-2.5 font-semibold text-white transition hover:bg-[#087F8C]"
        >
          Iniciar sesión
        </Link>
      </header>

      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#DDF8F7] text-4xl">
            🌿
          </div>

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#087F8C]">
            Salud y prevención
          </p>

          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
            Bienvenido a{" "}
            <span className="text-[#00AEBB]">Semáforo Vital</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Una plataforma para consultar información de los albergues
            y apoyar la prevención de riesgos sanitarios después de
            una emergencia.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="rounded-xl bg-[#00AEBB] px-8 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#087F8C]"
            >
              Acceder a la plataforma
            </Link>

            <a
              href="#acerca"
              className="rounded-xl border border-[#B9D9D9] bg-white px-8 py-3.5 font-semibold text-[#087F8C] transition hover:bg-[#EAF8F8]"
            >
              Conocer el proyecto
            </a>
          </div>
        </div>
      </section>

      <section
        id="acerca"
        className="border-t border-[#DCEAEA] bg-white px-6 py-10 text-center"
      >
        <h2 className="text-xl font-bold">¿Qué es Semáforo Vital?</h2>
        <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-600">
          Es un proyecto orientado al seguimiento de las condiciones
          sanitarias en albergues, con el propósito de facilitar la
          identificación temprana de posibles riesgos y apoyar la toma
          de decisiones.
        </p>
      </section>

      <footer className="bg-[#087F8C] px-6 py-4 text-center text-sm text-white">
        Semáforo Vital · Salud, prevención y bienestar
      </footer>
    </main>
  );
}
