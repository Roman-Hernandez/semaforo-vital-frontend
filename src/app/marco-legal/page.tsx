import { PublicHeader } from "@/components/shared/PublicHeader";
import { PublicFooter } from "@/components/shared/PublicFooter";

export default function MarcoLegalPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0E2E33]">
      <PublicHeader activo="institucional" />

      <main className="anim-entrada mx-auto flex-1 max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="border-b border-[#DCE6EA] pb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0A252A] sm:text-4xl">
            Marco legal y términos de uso
          </h1>
        </div>

        <div className="divide-y divide-[#E4ECEE]">
          <section id="terminos-uso" className="scroll-mt-24 py-8">
            <h2 className="text-xl font-bold text-[#0A252A]">
              Términos de uso del sistema
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#375257]">
              El acceso a la vista pública de <strong>Semáforo Vital</strong> es libre y gratuito con fines informativos, preventivos y de apoyo comunitario. Los indicadores del semáforo sanitario reflejan los reportes registrados por los administradores designados en cada alojamiento temporal y sirven como apoyo a la toma de decisiones; no sustituyen los dictámenes médicos presenciales ni las órdenes de evacuación o cierre emitidas por las autoridades competentes.
            </p>
            <p className="mt-3 text-sm leading-7 text-[#375257]">
              Los usuarios con credenciales administrativas son responsables de la veracidad, oportunidad y exactitud de los datos de población, condiciones sanitarias, eventos epidemiológicos e intervenciones cargados en el sistema.
            </p>
          </section>

          <section id="tratamiento-datos" className="scroll-mt-24 py-8">
            <h2 className="text-xl font-bold text-[#0A252A]">
              Implicaciones legales y tratamiento de datos
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#375257]">
              En cumplimiento de la <strong>Ley Estatutaria 1581 de 2012</strong> y el <strong>Decreto 1377 de 2013</strong> sobre protección de datos personales en Colombia, la plataforma pública presenta únicamente indicadores agregados y anónimos por alojamiento temporal (ocupación total, disponibilidad de servicios sanitarios y nivel de riesgo). En ningún caso se publican nombres, números de identificación ni historias clínicas individuales de las personas albergadas.
            </p>
          </section>

          <section id="normatividad" className="scroll-mt-24 py-8">
            <h2 className="text-xl font-bold text-[#0A252A]">
              Articulación con la gestión del riesgo de desastres
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#375257]">
              La operación del sistema se enmarca en los principios de precaución, solidaridad y oportuna información establecidos en la <strong>Ley 1523 de 2012</strong> (Política Nacional de Gestión del Riesgo de Desastres y Sistema Nacional de Gestión del Riesgo de Desastres — SNGRD) y en las directrices de vigilancia en salud pública del Instituto Nacional de Salud (INS) y el Ministerio de Salud y Protección Social.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
