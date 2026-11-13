
"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardPlus,
  HeartPulse,
  Hospital,
  LockKeyhole,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
} from "lucide-react";

type CaseStatus = "Activo" | "En seguimiento" | "Recuperado";

interface DiseaseCase {
  id: number;
  disease: string;
  cases: number;
  date: string;
  status: CaseStatus;
  symptoms: string;
  observations: string;
}

interface CaseForm {
  disease: string;
  cases: string;
  date: string;
  status: CaseStatus;
  symptoms: string;
  observations: string;
}

const initialCases: DiseaseCase[] = [
  {
    id: 1,
    disease: "Infección respiratoria aguda",
    cases: 12,
    date: "2026-10-05",
    status: "Activo",
    symptoms: "Tos, fiebre y congestión nasal.",
    observations: "Se requiere seguimiento del grupo afectado.",
  },
  {
    id: 2,
    disease: "Gastroenteritis",
    cases: 6,
    date: "2026-10-06",
    status: "Activo",
    symptoms: "Diarrea, náuseas y dolor abdominal.",
    observations: "Se reforzaron las medidas de higiene.",
  },
  {
    id: 3,
    disease: "Dermatitis",
    cases: 6,
    date: "2026-10-03",
    status: "En seguimiento",
    symptoms: "Irritación y lesiones cutáneas.",
    observations: "Seguimiento de las condiciones de higiene.",
  },
  {
    id: 4,
    disease: "Infección respiratoria aguda",
    cases: 8,
    date: "2026-10-01",
    status: "Recuperado",
    symptoms: "Tos y congestión nasal.",
    observations: "Seguimiento finalizado.",
  },
  {
    id: 5,
    disease: "Conjuntivitis",
    cases: 4,
    date: "2026-10-02",
    status: "Recuperado",
    symptoms: "Enrojecimiento e irritación ocular.",
    observations: "Seguimiento finalizado.",
  },
];

const emptyForm: CaseForm = {
  disease: "Gastroenteritis",
  cases: "2",
  date: "2026-10-06",
  status: "Activo",
  symptoms: "",
  observations: "",
};

const statusStyles: Record<CaseStatus, string> = {
  Activo: "bg-[#FFF0F0] text-[#E34B4B]",
  "En seguimiento": "bg-[#FFF5DF] text-[#B77900]",
  Recuperado: "bg-[#E8F7F0] text-[#23845A]",
};

function formatDate(date: string) {
  if (!date) return "—";

  const [year, month, day] = date.split("-");
  return `${day} ${new Date(Number(year), Number(month) - 1, Number(day))
    .toLocaleString("es-CO", { month: "short" })
    .replace(".", "")} ${year}`;
}

function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${statusStyles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export default function EnfermedadesPage() {
  const [cases, setCases] = useState<DiseaseCase[]>(initialCases);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos los estados");
  const [form, setForm] = useState<CaseForm>(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedCase, setSelectedCase] = useState<DiseaseCase | null>(null);

  const totalCases = cases.reduce((total, item) => total + item.cases, 0);

  const activeCases = cases
    .filter((item) => item.status === "Activo")
    .reduce((total, item) => total + item.cases, 0);

  const recoveredCases = cases
    .filter((item) => item.status === "Recuperado")
    .reduce((total, item) => total + item.cases, 0);

  const diseasesCount = new Set(cases.map((item) => item.disease)).size;

  const newCases = cases
    .filter((item) => item.date === "2026-10-06")
    .reduce((total, item) => total + item.cases, 0);

  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      const matchesSearch = item.disease
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "Todos los estados" ||
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cases, search, statusFilter]);

  const diseaseStatistics = useMemo(() => {
    const statistics = new Map<string, number>();

    cases.forEach((item) => {
      statistics.set(
        item.disease,
        (statistics.get(item.disease) ?? 0) + item.cases
      );
    });

    return Array.from(statistics.entries())
      .map(([disease, count]) => ({ disease, count }))
      .sort((a, b) => b.count - a.count);
  }, [cases]);

  const maximumDiseaseCases = Math.max(
    ...diseaseStatistics.map((item) => item.count),
    1
  );

  const handleFormChange = <K extends keyof CaseForm>(
    field: K,
    value: CaseForm[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openForm = () => {
    setForm({
      ...emptyForm,
      date: new Date().toLocaleDateString("en-CA"),
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setError("");
  };

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const quantity = Number(form.cases);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Ingresa un número válido de personas afectadas.");
      return;
    }

    if (!form.symptoms.trim()) {
      setError("Debes ingresar los síntomas principales.");
      return;
    }

    if (!form.date) {
      setError("Debes seleccionar la fecha de detección.");
      return;
    }

    const newRecord: DiseaseCase = {
      id: Date.now(),
      disease: form.disease,
      cases: quantity,
      date: form.date,
      status: form.status,
      symptoms: form.symptoms.trim(),
      observations: form.observations.trim(),
    };

    setCases((previous) => [newRecord, ...previous]);
    setShowForm(false);
    setForm(emptyForm);
    setSuccess("El caso se registró correctamente.");
  };

  return (
    <div className="space-y-5 text-[#24364B]">
      {/* ENCABEZADO */}
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-xs text-[#8297A1]">
            Mi albergue / Enfermedades
          </p>
          <h1 className="text-2xl font-semibold text-[#203B45]">
            Enfermedades y casos
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E4F8F8] text-[#009EAD]">
            <Users size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#29434D]">
              Administrador del albergue
            </p>
            <p className="text-[10px] text-[#8297A1]">
              Albergue San José · Acceso local
            </p>
          </div>
        </div>
      </header>

      <p className="text-xs text-[#718895]">
        Registra y consulta los casos de enfermedades identificados en tu albergue.
      </p>

      {/* INFORMACIÓN DEL ALBERGUE */}
      <section className="flex flex-col justify-between gap-3 rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#E4F8F8] text-[#009EAD]">
            <Hospital size={21} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#24364B]">
              Albergue San José
            </h2>
            <p className="mt-1 text-[10px] text-[#8297A1]">
              Pereira · ALB-024 · 120 personas
            </p>
          </div>
        </div>

        <span className="text-[10px] font-semibold text-[#009EAD]">
          Solo información de tu albergue
        </span>
      </section>

      <div className="flex flex-wrap justify-between gap-2 text-[10px] text-[#8297A1]">
        <p>Periodo: 01–06 oct 2026</p>
        <p>Corte: 06 oct, 10:42 a. m.</p>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-[#F4D4D4] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs text-[#718895]">Casos activos</p>
            <span className="rounded-lg bg-[#FFF0F0] p-2 text-[#E34B4B]">
              <AlertTriangle size={16} />
            </span>
          </div>
          <p className="text-2xl font-semibold text-[#E34B4B]">
            {activeCases}
          </p>
          <p className="mt-2 text-[10px] text-[#8297A1]">
            Casos que requieren seguimiento
          </p>
        </article>

        <article className="rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs text-[#718895]">Casos nuevos</p>
            <span className="rounded-lg bg-[#E4F8F8] p-2 text-[#009EAD]">
              <ClipboardPlus size={16} />
            </span>
          </div>
          <p className="text-2xl font-semibold text-[#24364B]">
            {newCases}
          </p>
          <p className="mt-2 text-[10px] text-[#8297A1]">
            Detectados el 06 oct
          </p>
        </article>

        <article className="rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs text-[#718895]">Personas recuperadas</p>
            <span className="rounded-lg bg-[#E4F8F8] p-2 text-[#009EAD]">
              <HeartPulse size={16} />
            </span>
          </div>
          <p className="text-2xl font-semibold text-[#24364B]">
            {recoveredCases}
          </p>
          <p className="mt-2 text-[10px] text-[#8297A1]">
            En el periodo seleccionado
          </p>
        </article>

        <article className="rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs text-[#718895]">Enfermedades reportadas</p>
            <span className="rounded-lg bg-[#E4F8F8] p-2 text-[#009EAD]">
              <Stethoscope size={16} />
            </span>
          </div>
          <p className="text-2xl font-semibold text-[#24364B]">
            {diseasesCount}
          </p>
          <p className="mt-2 text-[10px] text-[#8297A1]">
            Tipos de enfermedad registrados
          </p>
        </article>
      </section>

      {/* ALERTA */}
      {activeCases > 0 && (
        <section className="flex items-start gap-3 rounded-lg bg-[#FFF6E3] p-4">
          <AlertTriangle
            size={17}
            className="mt-0.5 shrink-0 text-[#B77900]"
          />
          <div>
            <p className="text-xs font-semibold text-[#24364B]">
              {activeCases} casos activos en tu albergue
            </p>
            <p className="mt-1 text-[10px] text-[#718895]">
              Prioriza su seguimiento. Estos datos no determinan por sí solos el nivel de riesgo sanitario.
            </p>
          </div>
        </section>
      )}

      {success && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg bg-[#E8F7F0] p-3 text-xs text-[#23845A]"
        >
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {/* FORMULARIO DE REGISTRO */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#203B45]/50 p-3 backdrop-blur-[2px] sm:p-5">
          <section
            aria-labelledby="register-title"
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#DCE6EA] bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="register-title"
                  className="text-xl font-semibold text-[#203B45]"
                >
                  Registrar caso
                </h2>
                <p className="mt-1 text-xs text-[#8297A1]">
                  Nuevo registro estadístico · Aún no guardado
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Cerrar formulario"
                className="rounded-lg p-2 text-[#607985] transition hover:bg-[#F3F6FA] hover:text-[#203B45]"
              >
                <X size={21} />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#E4F8F8] p-3 text-xs text-[#009EAD]">
              <LockKeyhole size={17} className="shrink-0" />
              <span>Se registrará únicamente en Albergue San José · ALB-024.</span>
            </div>

            <p className="mb-5 text-[11px] text-[#8297A1]">
              * Campos obligatorios. El borrador no modifica los totales.
            </p>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div>
                  <label
                    htmlFor="disease"
                    className="mb-2 block text-sm font-semibold text-[#29434D]"
                  >
                    Enfermedad *
                  </label>
                  <select
                    id="disease"
                    required
                    value={form.disease}
                    onChange={(event) =>
                      handleFormChange("disease", event.target.value)
                    }
                    className="w-full rounded-lg border border-[#DCE6EA] bg-white px-3 py-3 text-sm text-[#607985] outline-none transition focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
                  >
                    <option value="Infección respiratoria aguda">
                      Infección respiratoria aguda
                    </option>
                    <option value="Gastroenteritis">Gastroenteritis</option>
                    <option value="Dermatitis">Dermatitis</option>
                    <option value="Conjuntivitis">Conjuntivitis</option>
                    <option value="Otra">Otra</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="caseQuantity"
                    className="mb-2 block text-sm font-semibold text-[#29434D]"
                  >
                    Número de personas afectadas *
                  </label>
                  <input
                    id="caseQuantity"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={form.cases}
                    onChange={(event) =>
                      handleFormChange("cases", event.target.value)
                    }
                    className="w-full rounded-lg border border-[#DCE6EA] px-3 py-3 text-sm text-[#607985] outline-none transition focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
                  />
                  <p className="mt-2 text-[11px] text-[#8297A1]">
                    Indica el total de personas, sin nombres.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="caseDate"
                    className="mb-2 block text-sm font-semibold text-[#29434D]"
                  >
                    Fecha de detección *
                  </label>
                  <input
                    id="caseDate"
                    type="date"
                    required
                    value={form.date}
                    onChange={(event) =>
                      handleFormChange("date", event.target.value)
                    }
                    className="w-full rounded-lg border border-[#DCE6EA] px-3 py-3 text-sm text-[#607985] outline-none transition focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="caseStatus"
                    className="mb-2 block text-sm font-semibold text-[#29434D]"
                  >
                    Estado del caso *
                  </label>
                  <select
                    id="caseStatus"
                    required
                    value={form.status}
                    onChange={(event) =>
                      handleFormChange(
                        "status",
                        event.target.value as CaseStatus
                      )
                    }
                    className="w-full rounded-lg border border-[#DCE6EA] bg-white px-3 py-3 text-sm text-[#607985] outline-none transition focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
                  >
                    <option value="Activo">Activo</option>
                    <option value="En seguimiento">En seguimiento</option>
                    <option value="Recuperado">Recuperado</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="symptoms"
                  className="mb-2 block text-sm font-semibold text-[#29434D]"
                >
                  Síntomas principales *
                </label>
                <textarea
                  id="symptoms"
                  required
                  rows={3}
                  maxLength={500}
                  value={form.symptoms}
                  onChange={(event) =>
                    handleFormChange("symptoms", event.target.value)
                  }
                  placeholder="Describe los síntomas principales..."
                  className="w-full resize-y rounded-lg border border-[#DCE6EA] px-3 py-3 text-sm text-[#607985] outline-none transition placeholder:text-[#9AAAB2] focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="caseObservations"
                  className="mb-2 block text-sm font-semibold text-[#29434D]"
                >
                  Observaciones
                </label>
                <textarea
                  id="caseObservations"
                  rows={3}
                  maxLength={500}
                  value={form.observations}
                  onChange={(event) =>
                    handleFormChange("observations", event.target.value)
                  }
                  placeholder="Escribe observaciones generales..."
                  className="w-full resize-y rounded-lg border border-[#DCE6EA] px-3 py-3 text-sm text-[#607985] outline-none transition placeholder:text-[#9AAAB2] focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
                />
                <p className="mt-2 text-[11px] text-[#8297A1]">
                  Solo observaciones generales. No incluyas datos personales.
                </p>
              </div>

              {error && (
                <p role="alert" className="rounded-lg bg-[#FFF0F0] p-3 text-xs text-[#D64545]">
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#E8EEF1] pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-[#DCE6EA] px-5 py-3 text-sm font-semibold text-[#607985] transition hover:bg-[#F3F6FA]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#00B9C7] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#009EAD] focus:outline-none focus:ring-2 focus:ring-[#00B9C7] focus:ring-offset-2"
                >
                  <Check size={17} />
                  Guardar registro
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* TABLA DE CASOS */}
      <section className="overflow-hidden rounded-xl border border-[#E4EBEF] bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
          <div>
            <h2 className="text-lg font-semibold text-[#203B45]">
              Casos registrados
            </h2>
            <p className="mt-1 text-[10px] text-[#8297A1]">
              {cases.length} registros · {totalCases} casos en total
            </p>
          </div>

          <button
            type="button"
            onClick={openForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#00B9C7] px-4 py-2.5 text-sm font-medium text-black transition hover:bg-[#009EAD]"
          >
            <ClipboardPlus size={20} />
            Registrar caso
          </button>
        </div>

        {/* BUSCADOR Y FILTRO */}
        <div className="flex flex-col gap-2 px-4 pb-4 sm:flex-row sm:px-5">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8297A1]"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar enfermedad..."
              aria-label="Buscar enfermedad"
              className="w-full rounded-lg border border-[#DCE6EA] py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#00B9C7]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filtrar por estado"
            className="rounded-lg border border-[#DCE6EA] bg-white px-3 py-2.5 text-xs text-[#607985] outline-none focus:border-[#00B9C7]"
          >
            <option>Todos los estados</option>
            <option>Activo</option>
            <option>En seguimiento</option>
            <option>Recuperado</option>
          </select>
        </div>

        {/* CONTENIDO DE LA TABLA */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-[#F5F8FA] text-[10px] uppercase text-[#8297A1]">
              <tr>
                <th className="px-4 py-3 font-medium sm:px-5">Enfermedad</th>
                <th className="px-4 py-3 font-medium">Número de casos</th>
                <th className="px-4 py-3 font-medium">Fecha de registro</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-center font-medium">Acción</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E8EEF1]">
              {filteredCases.map((item) => (
                <tr
                  key={item.id}
                  className="transition hover:bg-[#F8FBFC]"
                >
                  <td className="px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-lg p-2 ${
                          item.status === "Activo"
                            ? "bg-[#FFF0F0] text-[#E34B4B]"
                            : "bg-[#E4F8F8] text-[#009EAD]"
                        }`}
                      >
                        <Stethoscope size={16} />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-[#24364B]">
                          {item.disease}
                        </p>
                        <p className="mt-1 text-[11px] text-[#8297A1]">
                          {item.symptoms}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-xs font-semibold text-[#24364B]">
                    {item.cases}
                  </td>

                  <td className="px-4 py-3 text-xs text-[#718895]">
                    {formatDate(item.date)}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedCase(item)}
                      className="rounded-lg border border-[#00B9C7] px-3 py-1.5 text-xs font-semibold text-[#009EAD] transition hover:bg-[#E4F8F8]"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCases.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-xs text-[#8297A1]"
                  >
                    No se encontraron casos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap justify-between gap-2 px-5 py-4 text-[10px] text-[#8297A1]">
          <p>Mostrando {filteredCases.length} de {cases.length} registros</p>
          <p className="font-medium text-[#009EAD]">Página 1 de 1</p>
        </div>
      </section>

      {/* GRÁFICO DE ENFERMEDADES FRECUENTES */}
      <section className="rounded-xl border border-[#E4EBEF] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-[#203B45]">
            Enfermedades más frecuentes
          </h2>
          <p className="mt-1 text-sm text-[#8297A1]">
            Total de casos por enfermedad · Todos los estados
          </p>
        </div>

        <div className="space-y-5">
          {diseaseStatistics.map((item) => (
            <div key={item.disease}>
              <div className="mb-2 flex justify-between gap-3 text-sm">
                <span className="text-[#29434D]">{item.disease}</span>
                <span className="font-semibold text-[#24364B]">
                  {item.count} casos
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-[#F2F6F8]">
                <div
                  className="h-full rounded-full bg-[#00B9C7] transition-all"
                  style={{
                    width: `${(item.count / maximumDiseaseCases) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {diseaseStatistics.length > 0 && (
          <p className="mt-6 text-xs text-[#8297A1]">
            {diseaseStatistics[0].disease} concentra{" "}
            {Math.round(
              (diseaseStatistics[0].count / totalCases) * 100
            )}% de los casos registrados.
          </p>
        )}
      </section>

      {/* AVISO DE PRIVACIDAD */}
      <div className="flex items-center gap-2 pb-3 text-xs text-[#8297A1]">
        <ShieldCheck size={17} className="shrink-0" />
        Datos de ejemplo, generales y estadísticos. No se incluyen nombres de pacientes ni información médica personal.
      </div>

      {/* DETALLE DEL CASO */}
      {selectedCase && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#203B45]/40 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2
                id="detail-title"
                className="text-lg font-semibold text-[#203B45]"
              >
                Detalle del caso
              </h2>
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                aria-label="Cerrar detalle"
                className="rounded-lg p-1 text-[#718895] hover:bg-[#F3F6FA]"
              >
                <X size={21} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-[#8297A1]">Enfermedad</p>
                <p className="mt-1 font-semibold text-[#29434D]">
                  {selectedCase.disease}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#8297A1]">
                    Personas afectadas
                  </p>
                  <p className="mt-1 font-semibold text-[#29434D]">
                    {selectedCase.cases}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8297A1]">
                    Fecha de detección
                  </p>
                  <p className="mt-1 font-semibold text-[#29434D]">
                    {formatDate(selectedCase.date)}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs text-[#8297A1]">Estado</p>
                <StatusBadge status={selectedCase.status} />
              </div>

              <div>
                <p className="text-xs text-[#8297A1]">
                  Síntomas principales
                </p>
                <p className="mt-1 text-sm text-[#29434D]">
                  {selectedCase.symptoms}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#8297A1]">Observaciones</p>
                <p className="mt-1 text-sm text-[#29434D]">
                  {selectedCase.observations || "Sin observaciones."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCase(null)}
              className="mt-6 w-full rounded-lg bg-[#00B9C7] px-4 py-3 text-sm font-semibold text-white hover:bg-[#009EAD]"
            >
              Cerrar
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
