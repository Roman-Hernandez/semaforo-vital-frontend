import { PublicHeader } from "@/components/shared/PublicHeader";
import { PublicFooter } from "@/components/shared/PublicFooter";

export default function ContactoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0E2E33]">
      <PublicHeader activo="institucional" />

      <main className="anim-entrada mx-auto flex-1 max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="border-b border-[#DCE6EA] pb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0A252A] sm:text-4xl">
            Contacto y canales de atención
          </h1>
        </div>

        <dl className="mt-10 grid gap-8 sm:grid-cols-2">
          <div className="border-l-2 border-[#047270] pl-5">
            <dt className="text-sm font-bold text-[#0A252A]">
              Sede institucional
            </dt>
            <dd className="mt-2 text-sm leading-6 text-[#375257]">
              Corporación Instituto de Administración y Finanzas (CIAF)
              <br />
              Cra. 6 # 24-56, Pereira, Risaralda, Colombia
            </dd>
          </div>

          <div className="border-l-2 border-[#047270] pl-5">
            <dt className="text-sm font-bold text-[#0A252A]">
              Correo de soporte técnico
            </dt>
            <dd className="mt-2 text-sm leading-6 text-[#375257]">
              <a
                href="mailto:soporte.semaforovital@ciaf.edu.co"
                className="font-semibold text-[#047270] hover:underline"
              >
                soporte.semaforovital@ciaf.edu.co
              </a>
            </dd>
          </div>

          <div className="border-l-2 border-[#047270] pl-5">
            <dt className="text-sm font-bold text-[#0A252A]">
              Línea telefónica institucional
            </dt>
            <dd className="mt-2 text-sm leading-6 text-[#375257]">
              <a
                href="tel:+576063400100"
                className="font-semibold text-[#047270] hover:underline"
              >
                +57 (606) 340 0100
              </a>
            </dd>
          </div>

          <div className="border-l-2 border-[#C53030] pl-5">
            <dt className="text-sm font-bold text-[#9B2226]">
              Líneas nacionales de emergencia (24/7)
            </dt>
            <dd className="mt-2 text-sm leading-6 text-[#375257]">
              Línea única de emergencias: <strong>123</strong> · Cruz Roja: <strong>132</strong> · Defensa Civil: <strong>144</strong>
            </dd>
          </div>
        </dl>
      </main>

      <PublicFooter />
    </div>
  );
}
