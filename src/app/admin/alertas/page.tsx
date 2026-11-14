
"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";

type AlertItem = {
  id: string;
  title: string;
  code: string;
  type: string;
  priority: "Alta" | "Media" | "Baja";
  status: "Activa" | "Resuelta";
  date: string;
  description: string;
  responsible: string;
};

const alerts: AlertItem[] = [
  {
    id: "1",
    title: "Abastecimiento de agua restablecido",
    code: "ALT-003",
    type: "Agua",
    priority: "Alta",
    status: "Resuelta",
    date: "05 oct 2026",
    description:
      "Se verificó el suministro continuo de agua potable y la disponibilidad en los puntos de consumo.",
    responsible: "Administrador del albergue",
  },
  {
    id: "2",
    title: "Recolección de residuos normalizada",
    code: "ALT-002",
    type: "Saneamiento",
    priority: "Media",
    status: "Resuelta",
    date: "03 oct 2026",
    description:
      "Se confirmó la recolección de residuos y la limpieza de las zonas destinadas para su almacenamiento.",
    responsible: "Administrador del albergue",
  },
  {
    id: "3",
    title: "Limpieza de zonas comunes completada",
    code: "ALT-001",
    type: "Higiene",
    priority: "Media",
    status: "Resuelta",
    date: "01 oct 2026",
    description:
      "Se realizó la limpieza y desinfección de las zonas comunes del albergue.",
    responsible: "Administrador del albergue",
  },
];

const dateOptions = [
  { value: "30", label: "Últimos 30 días" },
  { value: "7", label: "Últimos 7 días" },
  { value: "all", label: "Todo el historial" },
];

export default function AlertasPage() {
  const [activeTab, setActiveTab] = useState<"activas" | "historial">(
    "historial"
  );
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("30");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  const activeAlerts = alerts.filter((alert) => alert.status === "Activa");
  const resolvedAlerts = alerts.filter(
    (alert) => alert.status === "Resuelta"
  );

  const visibleAlerts = useMemo(() => {
    const source =
      activeTab === "activas" ? activeAlerts : resolvedAlerts;

    return source.filter((alert) => {
      const matchesSearch =
        alert.title.toLowerCase().includes(search.toLowerCase()) ||
        alert.code.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "Todos" || alert.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [activeTab, search, typeFilter, activeAlerts, resolvedAlerts]);

  const latestAlert = resolvedAlerts[0];

  const exportHistory = () => {
    const headers = [
      "Código",
      "Alerta",
      "Tipo",
      "Prioridad",
      "Estado",
      "Fecha de cierre",
    ];

    const rows = resolvedAlerts.map((alert) => [
      alert.code,
      alert.title,
      alert.type,
      alert.priority,
      alert.status,
      alert.date,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${value.replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "historial-alertas.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      {/* Encabezado */}
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-[#24364B] sm:text-3xl">
          Alertas
        </h1>

        <p className="text-sm text-[#718895]">
          Consulta y da seguimiento a las alertas sanitarias de tu albergue.
        </p>

        <p className="text-xs font-medium text-[#009EAD]">
          Albergue San José · Pereira / Activo
        </p>
      </header>

      {/* Indicadores */}
      <section
        aria-label="Resumen de alertas"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <MetricCard
          title="Alertas activas"
          value={activeAlerts.length}
          description="Sin alertas vigentes"
          icon={<Bell size={19} />}
        />

        <MetricCard
          title="Prioridad crítica"
          value={activeAlerts.filter((alert) => alert.priority === "Alta").length}
          description="Sin atención inmediata"
          icon={<ShieldCheck size={19} />}
        />

        <MetricCard
          title="Resueltas"
          value={resolvedAlerts.length}
          description="En los últimos 30 días"
          icon={<CheckCircle2 size={19} />}
          valueColor="text-[#07966B]"
        />
      </section>

      {/* Estado general */}
      <section
        aria-label="Estado general de las alertas"
        className="rounded-xl border border-[#D5F0E5] bg-[#EAF8F1] p-4 sm:p-5"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-white/80 p-2 text-[#07966B]">
            <CheckCircle2 size={23} />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[#07966B]">
              Sin alertas activas
            </h2>

            <p className="mt-1 text-sm text-[#32896E]">
              Las condiciones del Albergue San José se mantienen estables.
              Continúa con la vigilancia diaria y los controles de prevención.
            </p>

            <p className="mt-2 text-xs text-[#718895]">
              Última actualización: 08 oct 2026 · 08:30
            </p>
          </div>
        </div>
      </section>

      {/* Seguimiento */}
      <section className="rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-lg font-semibold text-[#24364B]">
            Seguimiento de alertas
          </h2>

          <button
            type="button"
            onClick={exportHistory}
            disabled={resolvedAlerts.length === 0}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#E8FAFB] px-4 py-2 text-xs font-semibold text-[#009EAD] transition hover:bg-[#D5F4F5] disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <Download size={15} />
            Exportar historial
          </button>
        </div>

        {/* Pestañas */}
        <div
          role="tablist"
          aria-label="Tipo de alertas"
          className="mt-4 flex gap-2"
        >
          <button
            type="button"
            role="tab"
            id="tab-activas"
            aria-selected={activeTab === "activas"}
            aria-controls="panel-alertas"
            onClick={() => setActiveTab("activas")}
            className={`rounded-full px-4 py-2 text-xs font-medium transition ${
              activeTab === "activas"
                ? "bg-[#E8FAFB] text-[#009EAD]"
                : "bg-[#F3F6F8] text-[#718895] hover:bg-[#E9EFF2]"
            }`}
          >
            Activas ({activeAlerts.length})
          </button>

          <button
            type="button"
            role="tab"
            id="tab-historial"
            aria-selected={activeTab === "historial"}
            aria-controls="panel-alertas"
            onClick={() => setActiveTab("historial")}
            className={`rounded-full px-4 py-2 text-xs font-medium transition ${
              activeTab === "historial"
                ? "bg-[#E8FAFB] text-[#009EAD]"
                : "bg-[#F3F6F8] text-[#718895] hover:bg-[#E9EFF2]"
            }`}
          >
            Historial ({resolvedAlerts.length})
          </button>
        </div>

        {/* Filtros */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              size={16}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8297A1]"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título o identificador"
              aria-label="Buscar alertas por título o identificador"
              className="h-11 w-full rounded-lg border border-[#E4EBEF] bg-white pl-9 pr-3 text-xs text-[#24364B] outline-none transition placeholder:text-[#9AABB3] focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
            />
          </div>

          <div className="relative">
            <CalendarDays
              size={15}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8297A1]"
            />
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              aria-label="Filtrar por fecha"
              className="h-11 w-full appearance-none rounded-lg border border-[#E4EBEF] bg-white pl-9 pr-9 text-xs text-[#718895] outline-none focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
            >
              {dateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8297A1]"
            />
          </div>

          <div className="relative">
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              aria-label="Filtrar por tipo de alerta"
              className="h-11 w-full appearance-none rounded-lg border border-[#E4EBEF] bg-white px-3 pr-9 text-xs text-[#718895] outline-none focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
            >
              <option value="Todos">Todos los tipos</option>
              <option value="Agua">Agua</option>
              <option value="Saneamiento">Saneamiento</option>
              <option value="Higiene">Higiene</option>
            </select>
            <ChevronDown
              size={15}
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8297A1]"
            />
          </div>
        </div>

        {/* Tabla */}
        <div
          id="panel-alertas"
          role="tabpanel"
          aria-labelledby={activeTab === "activas" ? "tab-activas" : "tab-historial"}
          className="mt-5"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="bg-[#F3F6F8] text-[11px] font-semibold uppercase tracking-wide text-[#718895]">
                  <th scope="col" className="px-3 py-3">Alerta</th>
                  <th scope="col" className="px-3 py-3">Tipo</th>
                  <th scope="col" className="px-3 py-3">Prioridad</th>
                  <th scope="col" className="px-3 py-3">Estado</th>
                  <th scope="col" className="px-3 py-3">Cierre</th>
                  <th scope="col" className="px-3 py-3">Detalle</th>
                </tr>
              </thead>

              <tbody>
                {visibleAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="border-b border-[#E9EFF2] text-xs transition hover:bg-[#FAFCFD]"
                  >
                    <td className="px-3 py-4">
                      <p className="font-semibold text-sm text-[#24364B]">
                        {alert.title}
                      </p>
                      <p className="mt-1 text-[11px] text-[#8297A1]">
                        {alert.code}
                      </p>
                    </td>

                    <td className="px-3 py-4 text-[#718895]">
                      {alert.type}
                    </td>

                    <td className="px-3 py-4">
                      <PriorityBadge priority={alert.priority} />
                    </td>

                    <td className="px-3 py-4">
                      <span className="rounded-full bg-[#E8F7F0] px-3 py-1.5 text-[11px] font-semibold text-[#07966B]">
                        {alert.status}
                      </span>
                    </td>

                    <td className="px-3 py-4 text-[#718895]">
                      {alert.date}
                    </td>

                    <td className="px-3 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedAlert(alert)}
                        className="font-semibold text-[#009EAD] hover:underline focus:outline-none focus:ring-2 focus:ring-[#00B9C7] focus:ring-offset-2"
                        aria-label={`Ver detalle de ${alert.title}`}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visibleAlerts.length === 0 && (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <div className="rounded-full bg-[#E8FAFB] p-3 text-[#009EAD]">
                {activeTab === "activas" ? (
                  <Bell size={24} />
                ) : (
                  <Search size={24} />
                )}
              </div>

              <p className="mt-3 text-sm font-semibold text-[#24364B]">
                {activeTab === "activas"
                  ? "No hay alertas activas"
                  : "No se encontraron alertas"}
              </p>

              <p className="mt-1 text-xs text-[#8297A1]">
                {activeTab === "activas"
                  ? "Actualmente no hay alertas que requieran atención."
                  : "Intenta cambiar los filtros o el término de búsqueda."}
              </p>
            </div>
          )}

          <p className="mt-4 text-[10px] text-[#8297A1]">
            Mostrando {visibleAlerts.length} de{" "}
            {activeTab === "activas"
              ? activeAlerts.length
              : resolvedAlerts.length}{" "}
            alertas · Ordenadas por fecha de cierre
          </p>
        </div>
      </section>

      {/* Último cierre verificado */}
      {latestAlert && (
        <section className="rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[#07966B]" />
            <h2 className="text-sm font-semibold text-[#24364B]">
              Último cierre verificado
            </h2>
          </div>

          <div className="mt-3 space-y-2">
            <p className="text-sm font-semibold text-[#24364B]">
              {latestAlert.code} · {latestAlert.title}
            </p>

            <p className="text-xs leading-relaxed text-[#718895]">
              {latestAlert.description}
            </p>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-[#8297A1]">
              <span>Responsable: {latestAlert.responsible}</span>
              <span>Cierre: {latestAlert.date} · 16:20</span>
            </div>
          </div>
        </section>
      )}

      {/* Recomendación */}
      <section className="rounded-xl border border-[#D5F4F5] bg-[#E8FAFB] p-4">
        <div className="flex items-start gap-3">
          <Sparkles
            size={18}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-[#009EAD]"
          />

          <div>
            <h2 className="text-xs font-semibold text-[#008C99]">
              Mantén la vigilancia diaria
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#368D96]">
              Actualiza los casos y las condiciones sanitarias para detectar
              cambios oportunamente.
            </p>
          </div>
        </div>
      </section>

      <p className="text-[10px] text-[#9AABB3]">
        Información exclusiva del Albergue San José.
      </p>

      {/* Modal de detalle */}
      {selectedAlert && (
  <dialog
    open
    aria-labelledby="alert-detail-title"
    className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-[#172B3D]/40 p-4"
  >
    <section
      className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[#009EAD]">
                  {selectedAlert.code}
                </p>
                <h2
                  id="alert-detail-title"
                  className="mt-1 text-lg font-bold text-[#24364B]"
                >
                  {selectedAlert.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                aria-label="Cerrar detalle"
                className="rounded-lg p-2 text-[#718895] hover:bg-[#F3F6F8] focus:outline-none focus:ring-2 focus:ring-[#00B9C7]"
              >
                <Trash2 size={17} className="rotate-45" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-[#F3F6F8] p-3">
                <p className="text-[10px] text-[#8297A1]">Tipo</p>
                <p className="mt-1 text-sm font-semibold text-[#24364B]">
                  {selectedAlert.type}
                </p>
              </div>

              <div className="rounded-lg bg-[#F3F6F8] p-3">
                <p className="text-[10px] text-[#8297A1]">Prioridad</p>
                <div className="mt-1">
                  <PriorityBadge priority={selectedAlert.priority} />
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-[#24364B]">
                  Descripción
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[#718895]">
                  {selectedAlert.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#718895]">
                <Clock3 size={15} />
                Fecha de cierre: {selectedAlert.date}
              </div>

              <div className="flex items-center gap-2 text-xs text-[#718895]">
                <ShieldCheck size={15} />
                Responsable: {selectedAlert.responsible}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedAlert(null)}
              className="mt-6 w-full rounded-lg bg-[#009EAD] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#008B98] focus:outline-none focus:ring-2 focus:ring-[#00B9C7] focus:ring-offset-2"
            >
              Cerrar
            </button>
          </section>
        </dialog>

      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon,
  valueColor,
}: Readonly<{
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  valueColor?: string;
}>) {
  return (
    <article className="rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[#718895]">{title}</p>
        <span className="text-[#009EAD]">{icon}</span>
      </div>

      <p className={`mt-2 text-3xl font-bold ${valueColor}`}>{value}</p>

      <p className="mt-1 text-[10px] text-[#8297A1]">{description}</p>
    </article>
  );
}

function PriorityBadge({
  priority,
}: Readonly<{
  priority: AlertItem["priority"];
}>) {
  const styles = {
    Alta: "bg-[#FFF0EC] text-[#D66A4D]",
    Media: "bg-[#FFF6E5] text-[#B47A16]",
    Baja: "bg-[#E8F7F0] text-[#07966B]",
  };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}
