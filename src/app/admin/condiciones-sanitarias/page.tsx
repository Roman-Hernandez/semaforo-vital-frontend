
"use client";

import { useState } from "react";
import {
  Droplets,
  Bath,
  Hand,
  Trash2,
  Plus,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Pencil,
} from "lucide-react";

type Status = "Adecuado" | "Requiere atención" | "Crítico";

interface SanitaryRecord {
  id: number;
  waterAvailability: string;
  waterStatus: Status;
  bathrooms: number;
  latrines: number;
  hygieneStatus: Status;
  sanitationStatus: Status;
  observations: string;
  date: string;
}

const initialRecord: SanitaryRecord = {
  id: 1,
  waterAvailability: "Disponible",
  waterStatus: "Adecuado",
  bathrooms: 8,
  latrines: 4,
  hygieneStatus: "Adecuado",
  sanitationStatus: "Crítico",
  observations:
    "Residuos acumulados en el punto de recolección. 2 baños requieren limpieza.",
  date: "2026-10-06T08:30",
};

const statusStyles: Record<Status, string> = {
  Adecuado: "bg-[#E9F7F0] text-[#23845A]",
  "Requiere atención": "bg-[#FFF4DF] text-[#A96A00]",
  Crítico: "bg-[#FDECEC] text-[#D64545]",
};

const statusIcon = (status: Status) => {
  if (status === "Adecuado") return <CheckCircle2 size={12} />;
  if (status === "Crítico") return <AlertTriangle size={12} />;
  return <AlertTriangle size={12} />;
};

export default function CondicionesSanitariasPage() {
  const [record, setRecord] = useState(initialRecord);
  const [history, setHistory] = useState([initialRecord]);
  const [form, setForm] = useState(initialRecord);
  const [isEditing, setIsEditing] = useState(false);
  const [editingHistory, setEditingHistory] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    field: keyof SanitaryRecord,
    value: string | number
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleEdit = () => {
    setForm(record);
    setIsEditing(true);
    setEditingHistory(false);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setForm(record);
    setIsEditing(false);
    setEditingHistory(false);
    setError("");
    setSuccess("");
  };

  const handleSave: React.ComponentProps<"form">["onSubmit"] = (event) => {
  event.preventDefault();

    if (
      !form.waterAvailability ||
      !form.waterStatus ||
      !form.hygieneStatus ||
      !form.sanitationStatus ||
      !form.date
    ) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    if (
      !Number.isInteger(form.bathrooms) ||
      !Number.isInteger(form.latrines) ||
      form.bathrooms < 0 ||
      form.latrines < 0
    ) {
      setError("Las cantidades deben ser números enteros iguales o mayores que cero.");
      return;
    }

    const updatedRecord = {
      ...form,
      id: editingHistory ? record.id : Date.now(),
    };

    setRecord(updatedRecord);

    if (editingHistory) {
      setHistory((previous) =>
        previous.map((item) =>
          item.id === record.id ? updatedRecord : item
        )
      );
      setSuccess("Las condiciones sanitarias se actualizaron correctamente.");
    } else {
      setHistory((previous) => [updatedRecord, ...previous]);
      setSuccess("El registro de condiciones sanitarias se guardó correctamente.");
    }

    setIsEditing(false);
    setEditingHistory(false);
    setError("");
  };

  const statusBadge = (status: Status) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyles[status]}`}
    >
      {statusIcon(status)}
      {status}
    </span>
  );
  let bathroomStatus: Status = "Adecuado";

if (record.bathrooms === 0 || record.latrines === 0) {
  bathroomStatus = "Crítico";
} else if (record.bathrooms < 2) {
  bathroomStatus = "Requiere atención";
}

  const summaryCards = [
    {
      title: "Agua potable",
      value: record.waterAvailability,
      description: "Suministro de agua segura",
      status: record.waterStatus,
      icon: Droplets,
    },
    {
      title: "Baños y letrinas",
      value: `${record.bathrooms} baños · ${record.latrines} letrinas`,
      description: "Infraestructura sanitaria",
      status: bathroomStatus,
      icon: Bath,
    },
    {
      title: "Higiene",
      value: record.hygieneStatus,
      description: "Jabón y lavado de manos",
      status: record.hygieneStatus,
      icon: Hand,
    },
    {
      title: "Saneamiento",
      value: record.sanitationStatus === "Crítico"
        ? "Residuos acumulados"
        : record.sanitationStatus,
      description: "Recolección y disposición",
      status: record.sanitationStatus,
      icon: Trash2,
    },
  ] as const;

  const hasCriticalCondition = summaryCards.some(
    (item) => item.status === "Crítico"
  );

  const formatDate = (date: string) => {
    if (!date) return "Sin fecha";

    return new Date(date).toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 text-xs text-[#8297A1]">
            Mi albergue / Condiciones sanitarias
          </div>
          <h1 className="text-2xl font-semibold text-[#203B45]">
            Condiciones sanitarias
          </h1>
          <p className="mt-1 text-sm text-[#718895]">
            Registra y actualiza las condiciones sanitarias del albergue.
          </p>
        </div>

        <button
          type="button"
          onClick={handleEdit}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#00B9C7] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#009EAD]"
        >
          <Plus size={16} />
          Registrar condiciones
        </button>
      </div>

      {/* Estado actual */}
      <section aria-labelledby="estado-title" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="estado-title" className="text-sm font-semibold text-[#29434D]">
            Estado actual del albergue
          </h2>
          <p className="text-xs text-[#8297A1]">
            Último registro: {formatDate(record.date)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E4F8F8] text-[#009EAD]">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-sm font-medium text-[#29434D]">
                    {item.title}
                  </h3>
                </div>

                <p className="text-base font-semibold text-[#203B45]">
                  {item.value}
                </p>
                <p className="mb-3 mt-1 text-xs text-[#8297A1]">
                  {item.description}
                </p>

                {statusBadge(item.status)}
              </article>
            );
          })}
        </div>

        {hasCriticalCondition && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-[#F8D5D5] bg-[#FFF0F0] p-4"
          >
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-[#D64545]"
            />
            <div>
              <p className="text-sm font-semibold text-[#C53030]">
                Saneamiento crítico: requiere atención inmediata
              </p>
              <p className="mt-1 text-xs text-[#8C4545]">
                Revisa las condiciones sanitarias y realiza las acciones
                necesarias para atender las condiciones críticas.
              </p>
            </div>
          </div>
        )}

        <p className="text-[11px] text-[#8297A1]">
          Los datos iniciales son de ejemplo y no corresponden a una evaluación verificada.
        </p>
      </section>

      {/* Formulario */}
      {isEditing && (
        <section className="rounded-xl border border-[#E4EBEF] bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2 border-b border-[#E8EEF1] pb-4">
            <Plus size={18} className="text-[#009EAD]" />
            <div>
              <h2 className="text-base font-semibold text-[#29434D]">
                {editingHistory ? "Actualizar condiciones" : "Registrar condiciones"}
              </h2>
              <p className="mt-1 text-xs text-[#8297A1]">
                Completa la revisión sanitaria del albergue.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="waterAvailability"
                  className="mb-2 block text-xs font-medium text-[#29434D]"
                >
                  Disponibilidad de agua potable *
                </label>
                <select
                  id="waterAvailability"
                  required
                  value={form.waterAvailability}
                  onChange={(event) =>
                    handleChange("waterAvailability", event.target.value)
                  }
                  className="w-full rounded-lg border border-[#DCE6EA] bg-white px-3 py-2.5 text-sm text-[#29434D] outline-none focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Limitada">Limitada</option>
                  <option value="No disponible">No disponible</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="waterStatus"
                  className="mb-2 block text-xs font-medium text-[#29434D]"
                >
                  Estado del agua *
                </label>
                <select
                  id="waterStatus"
                  required
                  value={form.waterStatus}
                  onChange={(event) =>
                    handleChange("waterStatus", event.target.value as Status)
                  }
                  className="w-full rounded-lg border border-[#DCE6EA] bg-white px-3 py-2.5 text-sm text-[#29434D] outline-none focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
                >
                  <option value="Adecuado">Adecuado</option>
                  <option value="Requiere atención">Requiere atención</option>
                  <option value="Crítico">Crítico</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="bathrooms"
                  className="mb-2 block text-xs font-medium text-[#29434D]"
                >
                  Cantidad de baños *
                </label>
                <input
                  id="bathrooms"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={form.bathrooms}
                  onChange={(event) =>
                    handleChange("bathrooms", Number(event.target.value))
                  }
                  className="w-full rounded-lg border border-[#DCE6EA] px-3 py-2.5 text-sm text-[#29434D] outline-none focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="latrines"
                  className="mb-2 block text-xs font-medium text-[#29434D]"
                >
                  Cantidad de letrinas *
                </label>
                <input
                  id="latrines"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={form.latrines}
                  onChange={(event) =>
                    handleChange("latrines", Number(event.target.value))
                  }
                  className="w-full rounded-lg border border-[#DCE6EA] px-3 py-2.5 text-sm text-[#29434D] outline-none focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="hygieneStatus"
                  className="mb-2 block text-xs font-medium text-[#29434D]"
                >
                  Estado de higiene *
                </label>
                <select
                  id="hygieneStatus"
                  required
                  value={form.hygieneStatus}
                  onChange={(event) =>
                    handleChange("hygieneStatus", event.target.value as Status)
                  }
                  className="w-full rounded-lg border border-[#DCE6EA] bg-white px-3 py-2.5 text-sm text-[#29434D] outline-none focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
                >
                  <option value="Adecuado">Adecuado</option>
                  <option value="Requiere atención">Requiere atención</option>
                  <option value="Crítico">Crítico</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="sanitationStatus"
                  className="mb-2 block text-xs font-medium text-[#29434D]"
                >
                  Estado del saneamiento *
                </label>
                <select
                  id="sanitationStatus"
                  required
                  value={form.sanitationStatus}
                  onChange={(event) =>
                    handleChange("sanitationStatus", event.target.value as Status)
                  }
                  className="w-full rounded-lg border border-[#DCE6EA] bg-white px-3 py-2.5 text-sm text-[#29434D] outline-none focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
                >
                  <option value="Adecuado">Adecuado</option>
                  <option value="Requiere atención">Requiere atención</option>
                  <option value="Crítico">Crítico</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="observations"
                className="mb-2 block text-xs font-medium text-[#29434D]"
              >
                Observaciones
              </label>
              <textarea
                id="observations"
                rows={3}
                value={form.observations}
                onChange={(event) =>
                  handleChange("observations", event.target.value)
                }
                placeholder="Escribe las observaciones de la revisión..."
                className="w-full resize-y rounded-lg border border-[#DCE6EA] px-3 py-3 text-sm text-[#29434D] outline-none focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="mb-2 block text-xs font-medium text-[#29434D]"
              >
                Fecha y hora del registro *
              </label>
              <input
                id="date"
                type="datetime-local"
                required
                value={form.date}
                onChange={(event) => handleChange("date", event.target.value)}
                className="w-full rounded-lg border border-[#DCE6EA] px-3 py-2.5 text-sm text-[#29434D] outline-none focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10 sm:max-w-sm"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-[#D64545]">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse justify-end gap-2 border-t border-[#E8EEF1] pt-4 sm:flex-row">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#DCE6EA] px-4 py-2.5 text-sm text-[#607985] transition hover:bg-[#F5F9FB]"
              >
                <X size={16} />
                Cancelar
              </button>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-lg bg-[#00B9C7] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#009EAD]"
              >
                <Save size={16} />
                {editingHistory ? "Guardar cambios" : "Guardar registro"}
              </button>
            </div>
          </form>
        </section>
      )}

      {success && (
        <output className="block rounded-lg border border-[#CDEBDD] bg-[#E9F7F0] p-3 text-sm text-[#23845A]">
          {success}
        </output>
      )}

      {/* Historial */}
      <section className="overflow-hidden rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-[#29434D]">
              Historial de condiciones sanitarias
            </h2>
            <p className="mt-1 text-xs text-[#8297A1]">
              {history.length} registros de ejemplo · Más recientes primero
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#8297A1]">
            <Clock size={14} />
            Registro histórico
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead>
              <tr className="bg-[#F3F6FA] text-[11px] text-[#607985]">
                <th className="rounded-l-lg px-3 py-3 font-medium">Fecha</th>
                <th className="px-3 py-3 font-medium">Tipo de condición</th>
                <th className="px-3 py-3 font-medium">Estado</th>
                <th className="px-3 py-3 font-medium">Observaciones</th>
                <th className="rounded-r-lg px-3 py-3 font-medium">Acción</th>
              </tr>
            </thead>

            <tbody>
              {history.flatMap((item) => [
                {
                  id: `${item.id}-water`,
                  date: item.date,
                  type: "Agua potable",
                  status: item.waterStatus,
                  observation: item.waterAvailability,
                  record: item,
                },
                {
                  id: `${item.id}-bath`,
                  date: item.date,
                  type: "Baños y letrinas",
                  status: item.bathrooms === 0 || item.latrines === 0
                    ? "Crítico" as Status
                    : "Adecuado" as Status,
                  observation: `${item.bathrooms} baños y ${item.latrines} letrinas disponibles.`,
                  record: item,
                },
                {
                  id: `${item.id}-hygiene`,
                  date: item.date,
                  type: "Higiene",
                  status: item.hygieneStatus,
                  observation: item.observations || "Sin observaciones.",
                  record: item,
                },
                {
                  id: `${item.id}-sanitation`,
                  date: item.date,
                  type: "Saneamiento",
                  status: item.sanitationStatus,
                  observation: item.observations || "Sin observaciones.",
                  record: item,
                },
              ]).map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[#E8EEF1] text-xs text-[#29434D] last:border-0"
                >
                  <td className="whitespace-nowrap px-3 py-4">
                    {formatDate(item.date)}
                  </td>
                  <td className="px-3 py-4 font-medium">{item.type}</td>
                  <td className="px-3 py-4">{statusBadge(item.status)}</td>
                  <td className="max-w-xs px-3 py-4 text-[#718895]">
                    {item.observation}
                  </td>
                  <td className="px-3 py-4">
                    <button
                      type="button"
                      onClick={() => {
                        setForm(item.record);
                        setRecord(item.record);
                        setEditingHistory(true);
                        setIsEditing(true);
                        setError("");
                        setSuccess("");
                      }}
                      aria-label={`Editar registro de ${item.type}`}
                      className="rounded-lg p-2 text-[#009EAD] transition hover:bg-[#E4F8F8]"
                    >
                      <Pencil size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-[#8297A1]">
          <ShieldCheck size={15} />
          Solo puedes gestionar la información de tu albergue asignado.
        </div>
      </section>
    </div>
  );
}
