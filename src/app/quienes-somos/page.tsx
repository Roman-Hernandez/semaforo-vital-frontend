import { PublicHeader } from "@/components/shared/PublicHeader";
import { PublicFooter } from "@/components/shared/PublicFooter";

export default function QuienesSomosPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0E2E33]">
      <PublicHeader activo="institucional" />

      <main className="anim-entrada mx-auto flex-1 max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="border-b border-[#DCE6EA] pb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0A252A] sm:text-4xl">
            Quiénes somos
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#375257]">
            <strong>Semáforo Vital</strong> es un sistema de vigilancia sanitaria, seguimiento de condiciones de agua, saneamiento e higiene (WASH) y alerta temprana para alojamientos temporales, desarrollado como proyecto de investigación e innovación tecnológica en la <strong>Corporación Instituto de Administración y Finanzas (CIAF)</strong> en Pereira, Risaralda.
          </p>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-3">
          <section className="border-l-2 border-[#047270] pl-5">
            <h2 className="text-lg font-bold text-[#0A252A]">
              Propósito humanitario
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#4C666B]">
              Facilitar a los organismos de socorro, secretarías de salud y coordinadores de albergues una lectura objetiva del riesgo sanitario en tiempo real para prevenir brotes de enfermedades transmisibles.
            </p>
          </section>

          <section className="border-l-2 border-[#047270] pl-5">
            <h2 className="text-lg font-bold text-[#0A252A]">
              Transparencia ciudadana
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#4C666B]">
              Permitir que las familias y comunidades afectadas consulten qué albergues se encuentran habilitados, su disponibilidad de cupos y el estado general de sus condiciones de higiene.
            </p>
          </section>

          <section className="border-l-2 border-[#047270] pl-5">
            <h2 className="text-lg font-bold text-[#0A252A]">
              Rigor técnico
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#4C666B]">
              Alinear la operación de los alojamientos temporales con las normas mínimas humanitarias del Manual Esfera, la Organización Mundial de la Salud y el Sistema Nacional de Gestión del Riesgo de Desastres.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
