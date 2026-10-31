
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    Activity,
    Bell,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock3,
    Droplets,
    FileText,
    History,
    Info,
    Search,
    ShieldPlus,
    Users,
} from "lucide-react";

type Registro = {
    id: number;
    fecha: string;
    hora: string;
    categoria: string;
    descripcion: string;
    responsable: string;
    estado: string;
};

const registrosIniciales: Registro[] = [
    {
        id: 1,
        fecha: "06 oct. 2026",
        hora: "08:30",
        categoria: "Intervenciones",
        descripcion: "Jornada de limpieza completada en áreas comunes.",
        responsable: "Equipo operativo",
        estado: "Completado",
    },
    {
        id: 2,
        fecha: "05 oct. 2026",
        hora: "16:45",
        categoria: "Población",
        descripcion: "Ocupación actualizada: 120 personas de 200 plazas.",
        responsable: "Administración",
        estado: "Validado",
    },
    {
        id: 3,
        fecha: "04 oct. 2026",
        hora: "10:15",
        categoria: "Condiciones sanitarias",
        descripcion: "Control de agua potable y revisión de residuos.",
        responsable: "Equipo sanitario",
        estado: "Validado",
    },
    {
        id: 4,
        fecha: "03 oct. 2026",
        hora: "14:20",
        categoria: "Alertas",
        descripcion: "Alerta de ventilación cerrada tras la revisión.",
        responsable: "Equipo sanitario",
        estado: "Cerrado",
    },
    {
        id: 5,
        fecha: "02 oct. 2026",
        hora: "09:00",
        categoria: "Enfermedades",
        descripcion: "Consolidado actualizado: 5 casos acumulados.",
        responsable: "Equipo sanitario",
        estado: "Registrado",
    },
];

const categorias = [
    "Todos",
    "Población",
    "Condiciones sanitarias",
    "Enfermedades",
    "Alertas",
    "Intervenciones",
];

const responsables = [
    "Todos los responsables",
    "Equipo operativo",
    "Administración",
    "Equipo sanitario",
];
const numeroMes: Record<string, string> = {
    ene: "01",
    feb: "02",
    mar: "03",
    abr: "04",
    may: "05",
    jun: "06",
    jul: "07",
    ago: "08",
    sep: "09",
    oct: "10",
    nov: "11",
    dic: "12",
};

function convertirFechaISO(fecha: string): string {
    const [dia, mes, anio] = fecha.replace(".", "").split(" ");

    return `${anio}-${numeroMes[mes] ?? "01"}-${dia.padStart(2, "0")}`;
}
interface FiltrosHistorial {
    busqueda: string;
    categoria: string;
    responsable: string;
    fechaDesde: string;
    fechaHasta: string;
}

function coincideConFiltros(
    registro: Registro,
    filtros: FiltrosHistorial
): boolean {
    const texto = `${registro.descripcion} ${registro.categoria} ${registro.responsable}`.toLowerCase();

    if (!texto.includes(filtros.busqueda.toLowerCase().trim())) {
        return false;
    }

    if (
        filtros.categoria !== "Todos" &&
        registro.categoria !== filtros.categoria
    ) {
        return false;
    }

    if (
        filtros.responsable !== "Todos los responsables" &&
        registro.responsable !== filtros.responsable
    ) {
        return false;
    }

    const fechaRegistro = convertirFechaISO(registro.fecha);

    if (filtros.fechaDesde && fechaRegistro < filtros.fechaDesde) {
        return false;
    }

    if (filtros.fechaHasta && fechaRegistro > filtros.fechaHasta) {
        return false;
    }

    return true;
}
function InformacionSanitaria({
    registro,
}: {
    readonly registro: Registro;
}) {
    switch (registro.categoria) {
        case "Población":
            return (
                <>
                    <p className="text-sm font-semibold">
                        Ocupación del albergue
                    </p>
                    <p className="mt-2 text-sm text-sm">
                        Consulta de la ocupación registrada y de la capacidad disponible.
                    </p>
                    <p className="mt-2 text-sm text-sm">
                        Los valores anteriores y actuales deben obtenerse de los registros de población.
                    </p>
                </>
            );

        case "Condiciones sanitarias":
            return (
                <>
                    <p className="text-sm font-semibold">
                        Condiciones sanitarias
                    </p>
                    <p className="mt-2 text-sm text-sm">
                        Consulta de las condiciones evaluadas, sus indicadores y las observaciones registradas.
                    </p>
                    <p className="mt-2 text-sm text-sm">
                        Los resultados específicos se mostrarán cuando estén disponibles en el registro.
                    </p>
                </>
            );

        case "Enfermedades":
            return (
                <>
                    <p className="text-sm font-semibold">
                        Seguimiento de enfermedades
                    </p>
                    <p className="mt-2 text-sm text-sm">
                        Consulta de los casos agregados registrados y su evolución histórica.
                    </p>
                    <p className="mt-2 text-sm text-sm">
                        No se muestran datos personales de pacientes.
                    </p>
                </>
            );

        case "Alertas":
            return (
                <>
                    <p className="text-sm font-semibold">
                        Información de la alerta
                    </p>
                    <p className="mt-2 text-sm text-sm">
                        Consulta del motivo de la alerta, su estado y las acciones documentadas para atenderla.
                    </p>
                </>
            );

        case "Intervenciones":
            return (
                <>
                    <p className="text-sm font-semibold">
                        Actividad de intervención
                    </p>
                    <p className="mt-2 text-sm text-sm">
                        Consulta de la actividad realizada y del resultado documentado por el equipo responsable.
                    </p>
                </>
            );

        default:
            return (
                <p className="text-sm text-sm">
                    No hay información sanitaria adicional disponible para esta categoría.
                </p>
            );
    }
}
function obtenerResultadoEstado(estado: string): string {
    switch (estado) {
        case "Completado":
            return "La actividad figura como completada.";

        case "Cerrado":
            return "El registro figura como cerrado.";

        default:
            return `El registro figura como ${estado.toLowerCase()}.`;
    }
}

export default function HistorialPage() {
    const [busqueda, setBusqueda] = useState("");
    const [categoria, setCategoria] = useState("Todos");
    const [responsable, setResponsable] = useState(
        "Todos los responsables",
    );
    const [fechaDesde, setFechaDesde] = useState("2026-10-01");
    const [fechaHasta, setFechaHasta] = useState("2026-10-06");
    const [registroSeleccionado, setRegistroSeleccionado] =
        useState<Registro | null>(null);

    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) return;

        if (registroSeleccionado && !dialog.open) {
            if (typeof dialog.showModal === "function") {
                dialog.showModal();
            } else {
                dialog.setAttribute("open", "");
            }
        } else if (!registroSeleccionado && dialog.open) {
            if (typeof dialog.close === "function") {
                dialog.close();
            } else {
                dialog.removeAttribute("open");
            }
        }
    }, [registroSeleccionado]);

    const registrosFiltrados = useMemo(() => {
        const filtros: FiltrosHistorial = {
            busqueda,
            categoria,
            responsable,
            fechaDesde,
            fechaHasta,
        };

        return registrosIniciales.filter((registro) =>
            coincideConFiltros(registro, filtros)
        );
    }, [busqueda, categoria, responsable, fechaDesde, fechaHasta]);

    const limpiarFiltros = () => {
        setBusqueda("");
        setCategoria("Todos");
        setResponsable("Todos los responsables");
        setFechaDesde("");
        setFechaHasta("");
    };

    const estadoColor = (estado: string) => {
        if (estado === "Completado") {
            return "bg-[#E5F6EB] text-sm";
        }

        if (estado === "Cerrado") {
            return "bg-[#E5F8F8] text-sm";
        }

        return "bg-[#EAF2FF] text-sm";
    };

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-3 text-sm">
            {/* Encabezado */}
            <header>
                <h1 className="font-extrabold tracking-tight sm:text-xl">
                    Historial del albergue
                </h1>
                <p className="mt-1 text-sm text-sm">
                    Consulta los registros y cambios realizados
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-sm">
                    <Droplets size={14} aria-hidden="true" />
                    Albergue San José · Pereira
                    <span className="text-sm">/ Tu albergue</span>
                </p>
            </header>

            {/* Aviso informativo */}
            <div className="flex items-center gap-2 rounded-lg bg-[#E5F9FA] px-3 py-2.5 text-sm text-sm">
                <Info size={15} className="shrink-0" aria-hidden="true" />
                Datos de ejemplo · Sin información personal de pacientes.
            </div>

            {/* Tarjetas de resumen */}
            <section
                aria-label="Resumen del historial"
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
            >
                <ResumenCard
                    titulo="Registros totales"
                    valor="128"
                    detalle="Desde la apertura"
                    icono={<History size={16} />}
                />
                <ResumenCard
                    titulo="Intervenciones realizadas"
                    valor="24"
                    detalle="Acciones completadas"
                    icono={<ShieldPlus size={18} />}
                />
                <ResumenCard
                    titulo="Alertas generadas"
                    valor="8"
                    detalle="Históricas · 0 activas"
                    icono={<Bell size={18} />}
                />
                <ResumenCard
                    titulo="Última actualización"
                    valor="06 oct. 2026"
                    detalle="08:30 · Equipo operativo"
                    icono={<Clock3 size={18} />}
                    fecha
                />
            </section>

            {/* Filtros */}
            <section className="rounded-xl border border-[#E3EAEE] bg-white p-3 sm:p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">

                    <label className="block text-sm text-sm">
                        Rango de fechas

                        <div className="mt-1 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-lg border border-[#E3EAEE] bg-white px-2 transition focus-within:border-[#00AEBB]">
                            <input
                                aria-label="Fecha desde"
                                type="date"
                                value={fechaDesde}
                                max={fechaHasta || undefined}
                                onChange={(e) => setFechaDesde(e.target.value)}
                                className="min-w-0 w-full cursor-pointer bg-transparent py-2.5 text-sm text-sm outline-none"
                            />

                            <span className="text-sm text-sm">–</span>

                            <input
                                aria-label="Fecha hasta"
                                type="date"
                                value={fechaHasta}
                                min={fechaDesde || undefined}
                                onChange={(e) => setFechaHasta(e.target.value)}
                                className="min-w-0 w-full cursor-pointer bg-transparent py-2.5 text-sm text-sm outline-none"
                            />
                        </div>
                    </label>


                    <label className="block text-sm text-sm">
                        Responsable
                        <div className="relative mt-1">
                            <select
                                value={responsable}
                                onChange={(e) => setResponsable(e.target.value)}
                                className="w-full appearance-none rounded-lg border border-[#E3EAEE] bg-white px-3 py-2.5 pr-8 text-sm text-sm outline-none focus:border-[#00AEBB]"
                            >
                                {responsables.map((opcion) => (
                                    <option key={opcion}>{opcion}</option>
                                ))}
                            </select>
                            <ChevronDown
                                size={15}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                                aria-hidden="true"
                            />
                        </div>
                    </label>

                    <label className="block text-sm text-sm">
                        Buscar registros
                        <div className="mt-1 flex items-center rounded-lg border border-[#E3EAEE] px-3 focus-within:border-[#00AEBB]">
                            <input
                                type="search"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar por descripción..."
                                className="w-full min-w-0 py-2.5 text-sm text-sm outline-none placeholder:text-sm"
                            />
                            <Search
                                size={16}
                                className="shrink-0 text-sm"
                                aria-hidden="true"
                            />
                        </div>
                    </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-sm text-sm">Categoría</span>
                    {categorias.map((opcion) => (
                        <button
                            key={opcion}
                            type="button"
                            onClick={() => setCategoria(opcion)}
                            aria-pressed={categoria === opcion}
                            className={`rounded-lg border px-3 py-1.5 text-sm transition ${categoria === opcion
                                ? "border-[#00AEBB] bg-[#E5F9FA] font-semibold text-sm"
                                : "border-[#E3EAEE] bg-white text-sm hover:border-[#00AEBB]"
                                }`}
                        >
                            {opcion}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={limpiarFiltros}
                        className="px-1 py-1 text-sm font-medium text-sm hover:underline"
                    >
                        Limpiar
                    </button>
                </div>
            </section>

            {/* Tabla y línea de tiempo */}
            <section className="grid min-w-0 grid-cols-1 items-start gap-3 2xl:grid-cols-[minmax(0,2.2fr)_minmax(250px,0.8fr)]">
                <div className="min-w-0 overflow-hidden rounded-xl border border-[#E3EAEE] bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-[#E3EAEE] px-4 py-3">
                        <h2 className="text-sm font-bold sm:text-sm">
                            Registros históricos
                        </h2>
                        <span className="text-sm text-sm sm:text-sm">
                            Más recientes primero ↓
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-[#F4F7FA] text-sm text-sm">
                                <tr>
                                    <th className="px-3 py-3 font-medium">Fecha / hora</th>
                                    <th className="px-3 py-3 font-medium">Categoría</th>
                                    <th className="px-3 py-3 font-medium">Descripción</th>
                                    <th className="px-3 py-3 font-medium">Responsable</th>
                                    <th className="px-3 py-3 font-medium">Estado</th>
                                    <th className="px-3 py-3 font-medium">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EAF0F4]">
                                {registrosFiltrados.map((registro) => (
                                    <tr key={registro.id} className="hover:bg-[#F8FBFC]">
                                        <td className="whitespace-nowrap px-3 py-3">
                                            <p className="text-sm">{registro.fecha}</p>
                                            <p className="mt-1 text-sm text-sm">
                                                {registro.hora}
                                            </p>
                                        </td>
                                        <td className="text-sm text-center">
                                            {registro.categoria}
                                        </td>
                                        <td className="min-w-[190px] px-3 py-3 leading-5 text-center text-sm">
                                            {registro.descripcion}
                                        </td>
                                        <td className="px-3 py-3  text-sm text-center">
                                            {registro.responsable}
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <span
                                                className={`whitespace-nowrap rounded-md px-2 py-1 text-sm ${estadoColor(registro.estado)}`}
                                            >
                                                {registro.estado}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-sm text-center">
                                            <button
                                                type="button"
                                                onClick={() => setRegistroSeleccionado(registro)}
                                                className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-sm hover:underline"
                                            >
                                                Ver detalle
                                                <ChevronRight size={11} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {registrosFiltrados.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-10 text-center text-sm text-sm"
                                        >
                                            No se encontraron registros con esos filtros.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap justify-between gap-2 border-t border-[#E3EAEE] px-3 py-3 text-sm text-sm">
                        <span>
                            {registrosFiltrados.length} registros en el período seleccionado
                        </span>
                        <span className="text-sm">
                            {registrosFiltrados.length > 0
                                ? `1–${registrosFiltrados.length} de ${registrosFiltrados.length}`
                                : "0 resultados"}
                        </span>
                    </div>
                </div>

                {/* Línea de tiempo */}
                <aside className="rounded-xl border border-[#E3EAEE] bg-white p-4 shadow-sm">
                    <h2 className="text-sm font-bold sm:text-sm">
                        Línea de tiempo
                    </h2>
                    <p className="mt-1 text-sm text-sm">
                        Otra forma de explorar los cambios
                    </p>

                    <div className="mt-4 space-y-0">
                        {registrosFiltrados.map((registro, indice) => (
                            <div key={registro.id} className="relative flex gap-3 pb-4 last:pb-0">
                                <div className="flex w-2.5 shrink-0 flex-col items-center">
                                    <span
                                        className={`z-10 mt-1 h-2.5 w-2.5 rounded-full border-2 border-[#00B8C4] ${indice === 0 ? "bg-[#00B8C4]" : "bg-white"
                                            }`}
                                    />
                                    {indice !== registrosFiltrados.length - 1 && (
                                        <span className="absolute bottom-0 top-3 w-px bg-[#D9E7EC]" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-sm">
                                        {registro.fecha} · {registro.hora}
                                    </p>
                                    <p className="mt-0.5 text-sm font-semibold">
                                        {registro.categoria}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setRegistroSeleccionado(registro)}
                                        className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-sm hover:underline"
                                    >
                                        Ver detalle <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {registrosFiltrados.length === 0 && (
                            <p className="py-4 text-sm text-sm">
                                No hay eventos para mostrar.
                            </p>
                        )}
                    </div>

                    <p className="mt-5 border-t border-[#EAF0F4] pt-3 text-sm leading-4 text-sm">
                        Los estados describen el registro, no el nivel de riesgo epidemiológico.
                    </p>
                </aside>
            </section>

            <p className="text-sm leading-4 text-sm">
                Información exclusiva del Albergue San José · Los estados del registro no indican nivel de riesgo.
            </p>

            {/* Detalle del registro */}
            <dialog
                ref={dialogRef}
                aria-labelledby="detalle-titulo"
                onClose={() => setRegistroSeleccionado(null)}
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        setRegistroSeleccionado(null);
                    }
                }}
                className="fixed inset-0 m-0 h-full w-full max-h-none max-w-none border-0 bg-transparent p-3 backdrop:bg-[#172B3B]/50 sm:p-6"
            >
                {registroSeleccionado && (
                    <section className="mx-auto my-auto flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#E3EAEE] bg-white shadow-2xl">
                        {/* Encabezado */}
                        <div className="flex items-start justify-between gap-3 border-b border-[#E3EAEE] bg-[#E8F9F9] p-5 sm:p-6">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-sm">
                                    Semáforo Vital · Historial sanitario
                                </p>

                                <h2
                                    id="detalle-titulo"
                                    className="mt-2 text-sm font-extrabold text-sm sm:text-1xl"
                                >
                                    Detalle del registro
                                </h2>

                                <p className="mt-1 text-sm text-sm">
                                    Registro histórico #{String(registroSeleccionado.id).padStart(3, "0")}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setRegistroSeleccionado(null)}
                                aria-label="Cerrar detalle"
                                className="rounded-lg p-2 text-sm transition hover:bg-white hover:text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Contenido desplazable */}
                        <div className="space-y-6 overflow-y-auto p-5 sm:p-6">
                            {/* 1. Información general */}
                            <section>
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-sm">
                                    <Info size={18} className="text-sm" />
                                    Información general
                                </h3>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="rounded-lg border border-[#E3EAEE] p-3">
                                        <p className="text-sm text-sm">Fecha</p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {registroSeleccionado.fecha}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-[#E3EAEE] p-3">
                                        <p className="text-sm text-sm">Hora</p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {registroSeleccionado.hora}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-[#E3EAEE] p-3">
                                        <p className="text-sm text-sm">Categoría</p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {registroSeleccionado.categoria}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-[#E3EAEE] p-3">
                                        <p className="text-sm text-sm">Responsable</p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {registroSeleccionado.responsable}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-[#E3EAEE] p-3">
                                        <p className="text-sm text-sm">Estado del registro</p>
                                        <span
                                            className={`mt-2 inline-flex rounded-md px-2 py-1 text-sm ${estadoColor(
                                                registroSeleccionado.estado,
                                            )}`}
                                        >
                                            {registroSeleccionado.estado}
                                        </span>
                                    </div>

                                    <div className="rounded-lg border border-[#E3EAEE] p-3">
                                        <p className="text-sm text-sm">Albergue</p>
                                        <p className="mt-1 text-sm font-semibold">
                                            Albergue San José
                                        </p>
                                        <p className="text-sm text-sm">Pereira</p>
                                    </div>
                                </div>
                            </section>

                            {/* 2. Descripción del evento */}
                            <section>
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-sm">
                                    <FileText size={18} className="text-sm" />
                                    Descripción del evento
                                </h3>

                                <div className="rounded-xl bg-[#F5F9FB] p-4">
                                    <p className="text-sm font-semibold text-sm">
                                        {registroSeleccionado.categoria}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-sm">
                                        {registroSeleccionado.descripcion}
                                    </p>
                                </div>
                            </section>

                            {/* 3. Información sanitaria relacionada */}
                            <section>
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-sm">
                                    <Activity size={18} className="text-sm" />
                                    Información sanitaria relacionada
                                </h3>

                                <div className="rounded-xl border border-[#E3EAEE] p-4">
                                    <InformacionSanitaria
                                        registro={registroSeleccionado}
                                    />
                                </div>
                            </section>

                            {/* 4. Cambios registrados */}
                            <section>
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-sm">
                                    <History size={18} className="text-sm" />
                                    Cambios registrados
                                </h3>

                                <div className="rounded-xl border border-[#E3EAEE] p-4">
                                    <p className="text-sm text-sm">
                                        Este apartado permite comparar el valor anterior con el nuevo,
                                        identificar diferencias y consultar cuándo se realizó la actualización.
                                    </p>
                                    <p className="mt-2 text-sm text-sm">
                                        La comparación estará disponible cuando el registro incluya los valores anteriores y nuevos.
                                    </p>
                                </div>
                            </section>

                            {/* 5. Acciones y seguimiento */}
                            <section>
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-sm">
                                    <CheckCircle2 size={18} className="text-sm" />
                                    Acciones y seguimiento
                                </h3>

                                <div className="space-y-3 rounded-xl border border-[#E3EAEE] p-4">
                                    <div>
                                        <p className="text-sm font-semibold text-sm">
                                            Resultado registrado
                                        </p>
                                        <p className="mt-1 text-sm text-sm">
                                            {obtenerResultadoEstado(registroSeleccionado.estado)}
                                        </p>
                                    </div>

                                    <div className="border-t border-[#EAF0F4] pt-3">
                                        <p className="text-sm font-semibold text-sm">
                                            Observaciones y tareas pendientes
                                        </p>
                                        <p className="mt-1 text-sm text-sm">
                                            No hay observaciones adicionales disponibles en los datos de ejemplo.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* 6. Trazabilidad */}
                            <section>
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-sm">
                                    <Users size={18} className="text-sm" />
                                    Trazabilidad del registro
                                </h3>

                                <div className="rounded-xl bg-[#F5F9FB] p-4">
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <span className="h-3 w-3 rounded-full bg-[#00AEBB]" />
                                            <span className="h-8 w-px bg-[#D9E7EC]" />
                                        </div>

                                        <div className="flex-1">
                                            <p className="text-sm font-semibold">Registro consultado</p>
                                            <p className="mt-1 text-sm text-sm">
                                                {registroSeleccionado.fecha} · {registroSeleccionado.hora}
                                            </p>
                                            <p className="mt-1 text-sm text-sm">
                                                Responsable asociado: {registroSeleccionado.responsable}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Pie del modal */}
                        <div className="flex flex-col-reverse gap-2 border-t border-[#E3EAEE] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-sm text-sm">
                                Información sujeta a los registros disponibles.
                            </p>

                            <button
                                type="button"
                                onClick={() => setRegistroSeleccionado(null)}
                                className="rounded-lg bg-[#008994] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00747D]"
                            >
                                Cerrar detalle
                            </button>
                        </div>
                    </section>
                )}
            </dialog>

        </div>
    );
}

function ResumenCard({
    titulo,
    valor,
    detalle,
    icono,
    fecha = false,
}: {
    readonly titulo: string;
    readonly valor: string;
    readonly detalle: string;
    readonly icono: React.ReactNode;
    readonly fecha?: boolean;
}) {
    return (
        <article className="rounded-xl border border-[#E3EAEE] bg-white p-3 shadow-sm sm:p-4">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm text-sm">{titulo}</h2>
                <span className="text-sm" aria-hidden="true">
                    {icono}
                </span>
            </div>
            <p
                className={`mt-2 font-extrabold tracking-tight ${fecha ? "text-sm sm:text-sm" : "text-2xl"
                    }`}
            >
                {valor}
            </p>
            <p className="mt-1 text-sm text-sm">{detalle}</p>
        </article>
    );
}
