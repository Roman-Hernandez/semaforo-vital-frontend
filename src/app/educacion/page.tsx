"use client";

import {
  BookOpen,
  Droplets,
  HeartPulse,
  Home,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { PublicFooter } from "@/components/shared/PublicFooter";

const MODULOS_WASH = [
  {
    id: "agua-segura",
    titulo: "1. Abastecimiento y calidad de agua potable",
    icono: Droplets,
    resumen:
      "El acceso a agua segura y suficiente es la barrera primaria contra brotes de enfermedad diarreica aguda (EDA), cólera y hepatitis A en alojamientos temporales.",
    estandares: [
      {
        indicador: "Dotación mínima vital",
        valor: "≥ 15 litros / persona / día",
        detalle:
          "Para consumo humano (bebida y preparación de alimentos) e higiene personal básica. En fase aguda de supervivencia el mínimo absoluto es de 7,5 a 15 L/persona/día.",
      },
      {
        indicador: "Cloro libre residual",
        valor: "0,2 a 0,5 mg/L (ppm) en punto de consumo",
        detalle:
          "En caso de brote diarreico activo o turbiedad < 5 UNT, mantener entre 0,5 y 1,0 mg/L con tiempo de contacto mínimo de 30 minutos.",
      },
      {
        indicador: "Distancia y acceso a grifos",
        valor: "Máximo 250 personas por grifo",
        detalle:
          "La distancia desde cualquier unidad habitacional hasta el punto de agua no debe superar los 500 metros y el tiempo de espera debe ser menor a 30 minutos.",
      },
    ],
    practicas: [
      "Almacenar el agua tratada en recipientes de boca estrecha con tapa y grifo dispensador para evitar introducir manos o utensilios.",
      "Si no se cuenta con cloración certificada, hervir el agua vigorosamente durante al menos 1 minuto (o 3 minutos en altitudes superiores a 2.000 m s. n. m.).",
      "Lavar y desinfectar los tanques de reserva con solución de hipoclorito de sodio antes de su llenado inicial y de forma periódica.",
    ],
    fuente:
      "Asociación Esfera (2018), Norma 2.1 de Abastecimiento de Agua; OMS (2022), Guías para la calidad del agua de consumo humano, 4.ª ed.",
  },
  {
    id: "excretas-saneamiento",
    titulo: "2. Disposición de excretas y baterías sanitarias",
    icono: ShieldCheck,
    resumen:
      "La contención segura de excretas humanas interrumpe la transmisión fecal-oral y protege las fuentes de agua superficial y subterránea cercanas al albergue.",
    estandares: [
      {
        indicador: "Proporción máxima de usuarios por sanitario",
        valor: "Máximo 20 personas por inodoro o letrina",
        detalle:
          "En las primeras horas de una emergencia puede iniciarse con 1 por cada 50 personas, reduciendo a 1 por cada 20 personas lo antes posible.",
      },
      {
        indicador: "Separación, privacidad y seguridad",
        valor: "Proporción 3:1 (mujeres : hombres)",
        detalle:
          "Baterías separadas por sexo, señalizadas, con cierre interno seguro e iluminación nocturna para prevenir violencias basadas en género.",
      },
      {
        indicador: "Distancia respecto a fuentes de agua",
        valor: "Mínimo 30 metros de cualquier fuente",
        detalle:
          "El fondo de cualquier foso o pozo séptico debe situarse al menos 1,5 metros por encima del nivel freático.",
      },
    ],
    practicas: [
      "Realizar limpieza y desinfección de inodoros, pisos y manijas al menos 2 veces al día utilizando solución clorada al 0,2 %.",
      "Garantizar disponibilidad continua de papel higiénico, recipientes con tapa para residuos menstruales y suministro de agua para descarga.",
      "Clausurar e inactivar de inmediato cualquier unidad sanitaria colapsada o sin sello hidráulico para evitar proliferación de moscas y vectores.",
    ],
    fuente:
      "Asociación Esfera (2018), Norma 3.1 y 3.2 de Gestión de Excretas; OPS/OMS (2020), Saneamiento en situaciones de desastre.",
  },
  {
    id: "higiene-manos",
    titulo: "3. Higiene de manos y prevención de infecciones",
    icono: HeartPulse,
    resumen:
      "El lavado de manos con agua y jabón reduce hasta en un 40 % la incidencia de enfermedades diarreicas y en más del 20 % las infecciones respiratorias agudas (IRA).",
    estandares: [
      {
        indicador: "Puntos de lavado de manos en sanitarios",
        valor: "A menos de 5 metros de cada batería",
        detalle:
          "Todo bloque de baños debe contar con estación funcional equipada permanentemente con agua corriente y jabón (o solución hidroalcohólica ≥ 60 %).",
      },
      {
        indicador: "Dotación mínima de insumos de higiene",
        valor: "250 g de jabón corporal / persona / mes",
        detalle:
          "Adicionalmente 200 g de jabón para lavado de ropa por persona al mes, garantizando reposición periódica.",
      },
    ],
    practicas: [
      "Cinco momentos críticos en albergues: (1) antes de preparar alimentos, (2) antes de comer o alimentar a niñas y niños, (3) después de usar el sanitario, (4) después de cambiar pañales, y (5) tras toser, estornudar o manipular residuos.",
      "Frotar palmas, dorso, espacios interdigitales, pulgares y uñas con jabón durante al menos 40 a 60 segundos antes de enjuagar.",
    ],
    fuente:
      "OMS (2009), Directrices de la OMS sobre higiene de las manos en la atención sanitaria; Asociación Esfera (2018), Norma 1.2 de Promoción de la Higiene.",
  },
  {
    id: "residuos-vectores",
    titulo: "4. Gestión de residuos sólidos y control vectorial",
    icono: Trash2,
    resumen:
      "El manejo adecuado de basuras y aguas estancadas previene la proliferación de roedores, moscas y mosquitos transmisores de dengue, zika y chikungunya.",
    estandares: [
      {
        indicador: "Contenedores por población alojada",
        valor: "1 recipiente de 100 L por cada 10 familias",
        detalle:
          "Recipientes con tapa ajustada, bolsa plástica resistente y ubicados a no más de 100 metros de las áreas de alojamiento.",
      },
      {
        indicador: "Frecuencia de recolección interna",
        valor: "Diaria hacia punto de acopio aislado",
        detalle:
          "El centro de acopio temporal debe estar cercado, techado, señalizado y alejado de cocinas comunitarias y dormitorios.",
      },
    ],
    practicas: [
      "Separar en la fuente los residuos orgánicos, reciclables, ordinarios y biosanitarios (tapabocas, gasas, guantes en bolsa roja).",
      "Eliminar criaderos del mosquito Aedes aegypti cepillando paredes internas de tanques y evitando acumulación de agua lluvia en llantas, lonas o envases.",
    ],
    fuente:
      "Asociación Esfera (2018), Norma 4.1 de Control de Vectores y Norma 5.1 de Gestión de Desechos Sólidos; Ministerio de Salud y Protección Social de Colombia / INS.",
  },
  {
    id: "alojamiento-ventilacion",
    titulo: "5. Espacio vital, ventilación y control del hacinamiento",
    icono: Home,
    resumen:
      "El control de la densidad ocupacional y la ventilación cruzada disminuyen drásticamente la tasa de transmisión (β) de virus respiratorios y afecciones cutáneas.",
    estandares: [
      {
        indicador: "Superficie cubierta mínima por persona",
        valor: "≥ 3,5 m² por persona (clima cálido/templado)",
        detalle:
          "En climas fríos o donde las actividades diarias se realizan bajo techo, se recomienda entre 4,5 y 5,5 m² por persona.",
      },
      {
        indicador: "Separación entre camas o colchonetas",
        valor: "Mínimo 0,75 a 1,0 metro entre bordes",
        detalle:
          "Orientar las camas alternando cabeza-pies para reducir la exposición directa a gotículas respiratorias durante el sueño.",
      },
    ],
    practicas: [
      "Mantener ventanas y aberturas superiores despejadas para asegurar renovación constante de aire natural en dormitorios colectivos.",
      "Habilitar un área de aislamiento preventivo con baño exclusivo para personas que presenten fiebre, tos persistente, vómito o diarrea aguda.",
    ],
    fuente:
      "Asociación Esfera (2018), Norma 3 de Alojamiento y Asentamientos (Espacio Vital); ACNUR, Manual para Situaciones de Emergencia.",
  },
];

const REFERENCIAS_OFICIALES = [
  {
    autores: "Asociación Esfera",
    anio: "2018",
    titulo:
      "El Manual Esfera: Carta Humanitaria y normas mínimas para la respuesta humanitaria (4.ª edición)",
    capitulo:
      "Capítulo 6: Abastecimiento de agua, saneamiento y promoción de la higiene (WASH) y Capítulo 8: Alojamiento y asentamientos",
    url: "https://spherestandards.org/es/handbook-2018/",
  },
  {
    autores: "Organización Mundial de la Salud (OMS)",
    anio: "2022",
    titulo:
      "Guidelines for drinking-water quality: Fourth edition incorporating the first and second addenda",
    capitulo: "Capítulos 7 (Microbial aspects) y 11 (Drinking-water in emergencies)",
    url: "https://www.who.int/publications/i/item/9789240045064",
  },
  {
    autores: "Organización Panamericana de la Salud (OPS / OMS)",
    anio: "2020",
    titulo:
      "Agua, saneamiento e higiene (WASH) en emergencias de salud pública y desastres en América Latina y el Caribe",
    capitulo:
      "Guía técnica operativa para albergues temporales e instalaciones colectivas",
    url: "https://www.paho.org/es/temas/agua-saneamiento",
  },
  {
    autores:
      "Ministerio de Salud y Protección Social de Colombia & Unidad Nacional para la Gestión del Riesgo de Desastres (UNGRD)",
    anio: "2021",
    titulo:
      "Lineamientos técnicos para el manejo sanitario de alojamientos temporales en situaciones de emergencia y desastre en Colombia",
    capitulo:
      "Vigilancia en salud pública comunitaria, calidad de agua (Resolución 2115 de 2007) y control vectorial",
    url: "https://www.minsalud.gov.co/",
  },
];

export default function EducacionSanitariaPage() {
  return (
    <div className="min-h-screen bg-[#FAFCFB] text-[#0E2E33]">
      <PublicHeader activo="educacion" />

      <main className="anim-entrada">
        <section className="border-b border-[#DCE6EA] bg-[#F2F7F6] py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-[#0A252A] sm:text-4xl">
              Guía de saneamiento básico y salud ambiental en albergues (WASH)
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#375257]">
              Estándares técnicos fundamentados en el{" "}
              <strong className="text-[#0E2E33]">Manual Esfera</strong>, la{" "}
              <strong className="text-[#0E2E33]">
                Organización Mundial de la Salud (OMS/OPS)
              </strong>{" "}
              y el{" "}
              <strong className="text-[#0E2E33]">
                Ministerio de Salud y Protección Social de Colombia
              </strong>
              .
            </p>

            <nav
              aria-label="Índice de temas de saneamiento"
              className="mt-7 flex flex-wrap gap-2"
            >
              {MODULOS_WASH.map((modulo) => (
                <a
                  key={modulo.id}
                  href={`#${modulo.id}`}
                  className="anim-interactivo border border-[#C8DAD8] bg-white px-3.5 py-2 text-xs font-semibold text-[#047270] hover:border-[#047270]"
                >
                  {modulo.titulo}
                </a>
              ))}
              <a
                href="#referencias"
                className="anim-interactivo border border-[#C8DAD8] bg-white px-3.5 py-2 text-xs font-semibold text-[#0E2E33] hover:border-[#047270]"
              >
                Referencias bibliográficas
              </a>
            </nav>
          </div>
        </section>

        <div className="mx-auto max-w-6xl divide-y divide-[#DCE6EA] px-4 sm:px-6 lg:px-8">
          {MODULOS_WASH.map((modulo) => {
            const Icono = modulo.icono;
            return (
              <article
                key={modulo.id}
                id={modulo.id}
                className="scroll-mt-24 py-12"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#E7F3F1] text-[#047270]">
                    <Icono size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-[#0A252A]">
                      {modulo.titulo}
                    </h2>
                    <p className="mt-1.5 max-w-3xl text-sm leading-6 text-[#4C666B]">
                      {modulo.resumen}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-bold text-[#047270]">
                    Indicadores técnicos de referencia
                  </h3>
                  <dl className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {modulo.estandares.map((est) => (
                      <div
                        key={est.indicador}
                        className="border-l-2 border-[#047270] bg-white p-5 shadow-2xs"
                      >
                        <dt className="text-xs font-medium text-[#5E767A]">
                          {est.indicador}
                        </dt>
                        <dd className="mt-1 text-base font-extrabold text-[#0A252A]">
                          {est.valor}
                        </dd>
                        <p className="mt-2 text-xs leading-5 text-[#4C666B]">
                          {est.detalle}
                        </p>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-bold text-[#047270]">
                    Protocolo operativo recomendado en el albergue
                  </h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#2C474C]">
                    {modulo.practicas.map((practica) => (
                      <li key={practica}>{practica}</li>
                    ))}
                  </ul>
                </div>

                <p className="mt-5 text-xs text-[#5E767A]">
                  <strong className="text-[#0E2E33]">Fuente técnica citada:</strong>{" "}
                  <cite className="not-italic">{modulo.fuente}</cite>
                </p>
              </article>
            );
          })}
        </div>

        <section
          id="referencias"
          aria-labelledby="titulo-referencias"
          className="scroll-mt-24 border-t border-[#DCE6EA] bg-[#F2F7F6] py-14"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 pb-6">
              <BookOpen size={20} aria-hidden="true" className="text-[#047270]" />
              <h2
                id="titulo-referencias"
                className="text-2xl font-bold text-[#0A252A]"
              >
                Fuentes y referencias bibliográficas oficiales
              </h2>
            </div>

            <ol className="divide-y divide-[#DCE6EA] bg-white p-6 text-xs leading-6 text-[#375257] sm:p-8">
              {REFERENCIAS_OFICIALES.map((ref) => (
                <li key={ref.titulo} className="py-4 first:pt-0 last:pb-0">
                  <p className="font-semibold text-[#0E2E33]">
                    {ref.autores} ({ref.anio}).{" "}
                    <cite className="font-bold italic">{ref.titulo}</cite>.
                  </p>
                  <p className="text-[#4C666B]">{ref.capitulo}.</p>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#047270] hover:underline"
                  >
                    Consultar fuente oficial ({ref.url})
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
