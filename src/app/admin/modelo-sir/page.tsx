
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  HeartPulse,
  Info,
  Play,
  RotateCcw,
  ShieldCheck,
  Users,
} from "lucide-react";

type SIRPoint = {
  day: number;
  s: number;
  i: number;
  r: number;
};

type SimulationResult = {
  data: SIRPoint[];
  peak: number;
  peakDay: number;
  finalSusceptible: number;
  finalInfected: number;
  finalRecovered: number;
};

type MetricCardProps = Readonly<{
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  color: string;
  iconBg: string;
}>;

type SIRChartProps = Readonly<{
  data: SIRPoint[];
  duration: number;
  peakDay: number;
  peak: number;
}>;

const INITIAL_SUSCEPTIBLE = 225;
const INITIAL_INFECTED = 15;
const INITIAL_RECOVERED = 5;
const TOTAL_POPULATION = 245;

export default function ModeloSirPage() {
  const [beta, setBeta] = useState("0.30");
  const [gamma, setGamma] = useState("0.10");
  const [duration, setDuration] = useState("60");
  const [executed, setExecuted] = useState(false);
  const [executionDate, setExecutionDate] = useState("");

  const validParameters =
    beta.trim() !== "" &&
    gamma.trim() !== "" &&
    duration.trim() !== "" &&
    Number.isFinite(Number(beta)) &&
    Number.isFinite(Number(gamma)) &&
    Number.isFinite(Number(duration)) &&
    Number(beta) >= 0 &&
    Number(beta) <= 1 &&
    Number(gamma) >= 0 &&
    Number(gamma) <= 1 &&
    Number(duration) >= 1 &&
    Number(duration) <= 365;

  const simulation = useMemo<SimulationResult>(() => {
    const betaValue = Number(beta);
    const gammaValue = Number(gamma);
    const days = Number(duration);

    let susceptible = INITIAL_SUSCEPTIBLE;
    let infected = INITIAL_INFECTED;
    let recovered = INITIAL_RECOVERED;

    const data: SIRPoint[] = [
      {
        day: 0,
        s: susceptible,
        i: infected,
        r: recovered,
      },
    ];

    if (
      !Number.isFinite(betaValue) ||
      !Number.isFinite(gammaValue) ||
      !Number.isFinite(days) ||
      betaValue < 0 ||
      betaValue > 1 ||
      gammaValue < 0 ||
      gammaValue > 1 ||
      days < 1 ||
      days > 365
    ) {
      return {
        data,
        peak: infected,
        peakDay: 0,
        finalSusceptible: susceptible,
        finalInfected: infected,
        finalRecovered: recovered,
      };
    }

    const step = 0.1;
    const totalSteps = Math.round(days / step);

    let peak = infected;
    let peakDay = 0;

    for (let index = 1; index <= totalSteps; index++) {
      const newInfections =
        (betaValue * susceptible * infected * step) /
        TOTAL_POPULATION;

      const newRecoveries = gammaValue * infected * step;

      susceptible -= newInfections;
      infected += newInfections - newRecoveries;
      recovered += newRecoveries;

      susceptible = Math.max(0, susceptible);
      infected = Math.max(0, infected);
      recovered = Math.max(0, recovered);

      const currentDay = Number((index * step).toFixed(1));

      if (infected > peak) {
        peak = infected;
        peakDay = currentDay;
      }

      if (index % 10 === 0 || index === totalSteps) {
        data.push({
          day: currentDay,
          s: susceptible,
          i: infected,
          r: recovered,
        });
      }
    }

    return {
      data,
      peak,
      peakDay,
      finalSusceptible: susceptible,
      finalInfected: infected,
      finalRecovered: recovered,
    };
  }, [beta, gamma, duration]);

  const executeSimulation = () => {
    if (!validParameters) return;

    setExecuted(true);
    setExecutionDate(
      new Date().toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    );
  };

  const resetSimulation = () => {
    setBeta("0.30");
    setGamma("0.10");
    setDuration("60");
    setExecuted(false);
    setExecutionDate("");
  };

  const lastPoint =
    simulation.data[simulation.data.length - 1];

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      {/* Encabezado */}
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#24364B] sm:text-3xl">
            Modelo SIR
          </h1>

          <p className="text-sm text-[#718895]">
            Simulación de la evolución epidemiológica del albergue
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="rounded-full bg-[#E8FAFB] px-3 py-1.5 text-[10px] font-semibold text-[#009EAD]">
            Escenario ilustrativo
          </span>

          <p className="mt-2 text-[10px] text-[#8297A1]">
            Datos ficticios · No son mediciones del albergue
          </p>
        </div>
      </header>

      {/* Indicadores */}
      <section
        aria-label="Indicadores iniciales de la simulación"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          title="Susceptibles (S)"
          value={INITIAL_SUSCEPTIBLE}
          description="91,8 % · Pueden adquirir la infección"
          icon={<Users size={19} />}
          color="text-[#009EAD]"
          iconBg="bg-[#E8FAFB]"
        />

        <MetricCard
          title="Infectados (I)"
          value={INITIAL_INFECTED}
          description="6,1 % · Infecciones iniciales simuladas"
          icon={<Activity size={19} />}
          color="text-[#E69A20]"
          iconBg="bg-[#FFF6E5]"
        />

        <MetricCard
          title="Recuperados (R)"
          value={INITIAL_RECOVERED}
          description="2,0 % · Recuperados al inicio"
          icon={<HeartPulse size={19} />}
          color="text-[#5279D9]"
          iconBg="bg-[#EDF2FC]"
        />

        <MetricCard
          title="Población total (N)"
          value={TOTAL_POPULATION}
          description="S + I + R · Total constante"
          icon={<ShieldCheck size={19} />}
          color="text-[#009EAD]"
          iconBg="bg-[#E8FAFB]"
        />
      </section>

      {/* Condiciones iniciales */}
      <section
        aria-label="Condiciones iniciales"
        className="flex items-start gap-3 rounded-lg bg-[#E8FAFB] p-3.5"
      >
        <Info
          size={16}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-[#009EAD]"
        />

        <p className="text-xs leading-relaxed text-[#008C99]">
          <span className="font-semibold">
            Condiciones iniciales · Día 0.
          </span>{" "}
          Población cerrada de 245 personas, sin ingresos ni salidas y sin
          reinfecciones.
        </p>
      </section>

      {/* Parámetros de simulación */}
      <section className="rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm sm:p-5">
        <div>
          <h2 className="text-lg font-semibold text-[#24364B]">
            Parámetros de simulación
          </h2>

          <p className="mt-1 text-xs text-[#718895]">
            Define los supuestos del modelo para explorar un escenario,
            no una situación sanitaria real.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Transmisión */}
          <div>
            <label
              htmlFor="beta"
              className="mb-2 block text-sm font-semibold text-[#24364B]"
            >
              Tasa de transmisión β
            </label>

            <div className="flex h-11 items-center rounded-lg border border-[#E4EBEF] px-3 focus-within:border-[#00B9C7]">
              <input
                id="beta"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={beta}
                onChange={(event) => {
                  setBeta(event.target.value);
                  setExecuted(false);
                }}
                className="w-full bg-transparent text-xs text-[#24364B] outline-none"
              />

              <span className="text-[11px] text-[#8297A1]">
                por día
              </span>
            </div>

            <p className="mt-2 text-[11px] text-[#8297A1]">
              Frecuencia de transmisión en el modelo.
            </p>
          </div>

          {/* Recuperación */}
          <div>
            <label
              htmlFor="gamma"
              className="mb-2 block text-sm font-semibold text-[#24364B]"
            >
              Tasa de recuperación γ
            </label>

            <div className="flex h-11 items-center rounded-lg border border-[#E4EBEF] px-3 focus-within:border-[#00B9C7]">
              <input
                id="gamma"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={gamma}
                onChange={(event) => {
                  setGamma(event.target.value);
                  setExecuted(false);
                }}
                className="w-full bg-transparent text-xs text-[#24364B] outline-none"
              />

              <span className="text-[11px] text-[#8297A1]">
                por día
              </span>
            </div>

            <p className="mt-2 text-[11px] text-[#8297A1]">
              Equivale a 10 días de infección en promedio.
            </p>
          </div>

          {/* Duración */}
          <div>
            <label
              htmlFor="duration"
              className="mb-2 block text-sm font-semibold text-[#24364B]"
            >
              Duración de la simulación
            </label>

            <div className="flex h-11 items-center rounded-lg border border-[#E4EBEF] px-3 focus-within:border-[#00B9C7]">
              <input
                id="duration"
                type="number"
                min="1"
                max="365"
                step="1"
                value={duration}
                onChange={(event) => {
                  setDuration(event.target.value);
                  setExecuted(false);
                }}
                className="w-full bg-transparent text-xs text-[#24364B] outline-none"
              />

              <span className="text-[11px] text-[#8297A1]">
                días
              </span>
            </div>

            <p className="mt-2 text-[11px] text-[#8297A1]">
              Horizonte de proyección desde el día 0.
            </p>
          </div>
        </div>

        {/* Validación */}
        {!validParameters && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-[#FFF0EC] p-3 text-xs text-[#C45C43]"
          >
            Ingresa valores válidos: β y γ entre 0 y 1, y duración entre
            1 y 365 días.
          </p>
        )}

        {/* Acciones */}
        <div className="mt-4 flex flex-col justify-between gap-3 border-t border-[#E4EBEF] pt-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={executeSimulation}
              disabled={!validParameters}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#00B9C7] px-4 py-3 text-xs font-semibold text-[#073B46] transition hover:bg-[#00A9B7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play size={15} />
              Ejecutar simulación
            </button>

            <button
              type="button"
              onClick={resetSimulation}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E4EBEF] px-4 py-3 text-xs font-semibold text-[#24364B] transition hover:bg-[#F3F6F8]"
            >
              <RotateCcw size={15} />
              Restablecer
            </button>
          </div>

          <p className="text-[10px] text-[#8297A1]">
            Tasas constantes durante los {duration || "0"} días
          </p>
        </div>

        {executed && (
          <p
            role="status"
            className="mt-3 rounded-lg bg-[#E8FAFB] p-3 text-xs text-[#008C99]"
          >
            Simulación local ejecutada correctamente. Los resultados son
            ilustrativos y no provienen del backend.
          </p>
        )}
      </section>

      {/* Gráfica SIR */}
      <section className="rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-[#24364B]">
              Proyección epidemiológica SIR
            </h2>

            <p className="mt-1 text-xs text-[#718895]">
              Evolución del escenario ficticio · {duration} días
            </p>
          </div>

          <span className="rounded-full bg-[#F3F6F8] px-3 py-1.5 text-[10px] text-[#718895]">
            N = 245 personas
          </span>
        </div>

        {/* Leyenda */}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-[#718895]">
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-5 bg-[#00AEBB]" />
            Susceptibles (S)
          </span>

          <span className="flex items-center gap-2">
            <span className="w-5 border-t-2 border-dashed border-[#E58A24]" />
            Infectados (I)
          </span>

          <span className="flex items-center gap-2">
            <span className="w-5 border-t-2 border-dotted border-[#5279D9]" />
            Recuperados (R)
          </span>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[10px] text-[#8297A1]">
            Número de personas
          </p>

          <SIRChart
            data={simulation.data}
            duration={Number(duration)}
            peakDay={simulation.peakDay}
            peak={simulation.peak}
          />
        </div>

        <div className="mt-3 flex flex-wrap justify-between gap-2 border-t border-[#E4EBEF] pt-3 text-[10px] text-[#8297A1]">
          <span>S + I + R = 245 en cada día de la proyección</span>
          <span>Etiquetas redondeadas a personas enteras</span>
        </div>
      </section>

      {/* Resultados */}
      <section className="rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <h2 className="text-lg font-semibold text-[#24364B]">
            Resultados de la simulación
          </h2>

          <span className="text-[10px] text-[#8297A1]">
            {executionDate
              ? `Ejecución: ${executionDate}`
              : "Escenario ilustrativo · Pendiente de ejecución"}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[150px_130px_1fr]">
          {/* Pico */}
          <div className="rounded-lg bg-[#FFF6E0] p-3">
            <p className="text-[10px] text-[#A87520]">
              Pico estimado de infectados
            </p>

            <p className="mt-2 text-2xl font-bold text-[#24364B]">
              ≈ {Math.round(simulation.peak)}
              <span className="ml-1 text-[10px] font-normal text-[#8297A1]">
                personas
              </span>
            </p>

            <p className="mt-1 text-[10px] text-[#A87520]">
              {((simulation.peak / TOTAL_POPULATION) * 100).toFixed(1)} %
              de la población simulada
            </p>
          </div>

          {/* Día del pico */}
          <div className="rounded-lg bg-[#F3F6F8] p-3">
            <p className="text-[10px] text-[#718895]">
              Día del pico
            </p>

            <p className="mt-2 text-2xl font-bold text-[#24364B]">
              {Math.round(simulation.peakDay)}
            </p>

            <p className="mt-1 text-[10px] text-[#718895]">
              Desde el inicio del escenario
            </p>
          </div>

          {/* Interpretación */}
          <div className="sm:px-1">
            <h3 className="text-xs font-semibold text-[#24364B]">
              Crecimiento inicial y descenso posterior
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-[#718895]">
              {simulation.peakDay === 0
                ? "Los infectados no superan el valor inicial durante el escenario."
                : `Los infectados alcanzan un máximo aproximado de ${Math.round(
                    simulation.peak
                  )} personas en el día ${Math.round(
                    simulation.peakDay
                  )}. Al día ${duration} se proyectan aproximadamente ${Math.round(
                    simulation.finalSusceptible
                  )} susceptibles, ${Math.round(
                    simulation.finalInfected
                  )} infectados y ${Math.round(
                    simulation.finalRecovered
                  )} recuperados.`}
            </p>

            <p className="mt-2 text-[10px] text-[#009EAD]">
              Datos ficticios · Depende de los supuestos del modelo.
            </p>
          </div>
        </div>
      </section>

      <p className="text-[10px] text-[#9AABB3]">
        Información ilustrativa del Modelo SIR. Los resultados definitivos
        dependerán de los datos y cálculos entregados por el backend.
      </p>
    </div>
  );
}

/* Tarjeta de indicadores */
function MetricCard({
  title,
  value,
  description,
  icon,
  color,
  iconBg,
}: MetricCardProps) {
  return (
    <article className="rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[#24364B]">
          {title}
        </p>

        <span className={`rounded-lg p-2 ${iconBg} ${color}`}>
          {icon}
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        <p className="text-3xl font-bold text-[#24364B]">
          {value}
        </p>

        <span className="text-[10px] text-[#8297A1]">
          personas
        </span>
      </div>

      <p className="mt-2 text-[10px] text-[#718895]">
        {description}
      </p>
    </article>
  );
}

/* Gráfica de las tres poblaciones SIR */
function SIRChart({
  data,
  duration,
  peakDay,
  peak,
}: SIRChartProps) {
  const width = 800;
  const height = 280;
  const left = 42;
  const right = 55;
  const top = 15;
  const bottom = 38;

    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;

    const safeDuration =
    Number.isFinite(duration) && duration > 0 ? duration : 60;

    const x = (day: number) =>
    left + (day / safeDuration) * plotWidth;

  const y = (value: number) =>
    top + plotHeight - (value / 250) * plotHeight;

  const createPath = (key: "s" | "i" | "r") =>
    data
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${x(point.day)} ${y(point[key])}`
      )
      .join(" ");

  const peakX = x(peakDay);
  const peakY = y(peak);
  const last = data[data.length - 1];

  const ticks = [0, 50, 100, 150, 200, 250];

  const dayTicks = Array.from({ length: 7 }, (_, index) =>
  Math.round((safeDuration * index) / 6)
);

  const labelX = Math.min(
    Math.max(peakX + 8, left),
    width - right - 105
  );

  const labelY = Math.max(peakY - 25, top);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Gráfica SIR durante ${duration} días. Pico de ${Math.round(
          peak
        )} infectados en el día ${Math.round(peakDay)}.`}
        className="h-auto w-full min-w-[500px]"
      >
        <title>Proyección epidemiológica SIR</title>

        <desc>
          Evolución simulada de personas susceptibles, infectadas y recuperadas.
        </desc>

        {/* Líneas horizontales y eje vertical */}
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={left}
              y1={y(tick)}
              x2={width - right}
              y2={y(tick)}
              stroke="#E4EBEF"
              strokeWidth="1"
            />

            <text
              x={left - 12}
              y={y(tick) + 4}
              textAnchor="end"
              fontSize="10"
              fill="#8297A1"
            >
              {tick}
            </text>
          </g>
        ))}

        {/* Días del eje horizontal */}
        {dayTicks.map((day, index) => (
          <text
            key={`${day}-${index}`}
            x={x(day)}
            y={height - 16}
            textAnchor="middle"
            fontSize="10"
            fill="#8297A1"
          >
            {day}
          </text>
        ))}

        {/* Susceptibles */}
        <path
          d={createPath("s")}
          fill="none"
          stroke="#00AEBB"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Infectados */}
        <path
          d={createPath("i")}
          fill="none"
          stroke="#E58A24"
          strokeWidth="2.5"
          strokeDasharray="8 5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Recuperados */}
        <path
          d={createPath("r")}
          fill="none"
          stroke="#5279D9"
          strokeWidth="2.5"
          strokeDasharray="2 5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Marcador del pico */}
        <line
          x1={peakX}
          y1={top}
          x2={peakX}
          y2={top + plotHeight}
          stroke="#E58A24"
          strokeWidth="1"
          strokeDasharray="3 4"
          opacity="0.7"
        />

        <circle
          cx={peakX}
          cy={peakY}
          r="4"
          fill="#E58A24"
          stroke="white"
          strokeWidth="2"
        />

        <rect
          x={labelX}
          y={labelY}
          width="100"
          height="22"
          rx="5"
          fill="#FFF6E0"
        />

        <text
          x={labelX + 50}
          y={labelY + 14}
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          fill="#A87520"
        >
          Pico ≈ {Math.round(peak)} · Día {Math.round(peakDay)}
        </text>

        {/* Valores finales */}
        <text
          x={width - right + 10}
          y={y(last.s) + 4}
          fontSize="10"
          fontWeight="600"
          fill="#00AEBB"
        >
          S · {Math.round(last.s)}
        </text>

        <text
          x={width - right + 10}
          y={y(last.i) + 4}
          fontSize="10"
          fontWeight="600"
          fill="#E58A24"
        >
          I · {Math.round(last.i)}
        </text>

        <text
          x={width - right + 10}
          y={y(last.r) + 4}
          fontSize="10"
          fontWeight="600"
          fill="#5279D9"
        >
          R · {Math.round(last.r)}
        </text>

        {/* Nombre del eje X */}
        <text
          x={left + plotWidth / 2}
          y={height - 1}
          textAnchor="middle"
          fontSize="10"
          fill="#8297A1"
        >
          Días
        </text>
      </svg>
    </div>
  );
}
