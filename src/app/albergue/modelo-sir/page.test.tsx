import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ModeloSIRPage from "@/layers/presentation/pages/modelo-sir-page";
import type {
  SIRGateway,
  SIRResult,
} from "@/layers/application/services/sir-service";

const resultadoCompleto: SIRResult = {
  albergue_id: "alb-1",
  albergue_nombre: "[DEMO] Albergue San José",
  poblacion_actual: 300,
  fecha_poblacion: "2026-11-17T00:00:00Z",
  generado_en: "2026-11-17T12:00:00Z",
  horizonte_dias: 14,
  ventana_datos_dias: 28,
  metodo_numerico: "RK4",
  datos_faltantes: [],
  supuestos: [
    "Estimación determinista ajustada a observaciones; no es una predicción clínicamente validada",
    "Población cerrada, mezcla homogénea, tasas constantes y sin reinfecciones durante el horizonte",
  ],
  resultados: {
    items: [
      {
        enfermedad: "Infección respiratoria aguda",
        estado: "estimacion_disponible",
        motivos: [],
        datos_faltantes: [],
        observado: [
          {
            fecha: "2026-11-14",
            poblacion: 300,
            infectados: 10,
            recuperados: 5,
            susceptibles: 285,
            registro_casos_id: "507f1f77bcf86cd799439011",
            registro_poblacion_id: "507f1f77bcf86cd799439022",
          },
          {
            fecha: "2026-11-15",
            poblacion: 300,
            infectados: 14,
            recuperados: 7,
            susceptibles: 279,
            registro_casos_id: "507f1f77bcf86cd799439012",
            registro_poblacion_id: "507f1f77bcf86cd799439022",
          },
          {
            fecha: "2026-11-16",
            poblacion: 300,
            infectados: 18,
            recuperados: 10,
            susceptibles: 272,
            registro_casos_id: "507f1f77bcf86cd799439013",
            registro_poblacion_id: "507f1f77bcf86cd799439022",
          },
          {
            fecha: "2026-11-17",
            poblacion: 300,
            infectados: 22,
            recuperados: 14,
            susceptibles: 264,
            registro_casos_id: "507f1f77bcf86cd799439014",
            registro_poblacion_id: "507f1f77bcf86cd799439022",
          },
        ],
        proyeccion: [
          {
            dia: 0,
            fecha: "2026-11-17",
            susceptibles: 264,
            infectados: 22,
            recuperados: 14,
          },
          {
            dia: 7,
            fecha: "2026-11-24",
            susceptibles: 210.4,
            infectados: 38.6,
            recuperados: 51.0,
          },
          {
            dia: 14,
            fecha: "2026-12-01",
            susceptibles: 175.2,
            infectados: 24.1,
            recuperados: 100.7,
          },
        ],
        parametros_estimados: {
          beta: 0.4215,
          gamma: 0.1842,
          error_ajuste_infectados: 0.65,
          intervalos_utilizados: 3,
          metodo:
            "Minimos cuadrados de flujos SIR integrados con regla trapezoidal",
        },
        resumen: {
          pico_infectados_en_horizonte: 38.6,
          fecha_pico_en_horizonte: "2026-11-24",
          infectados_finales: 24.1,
          recuperados_finales: 100.7,
          r_efectivo_inicial: 2.013,
          error_maximo_poblacion: 1e-11,
        },
      },
      {
        enfermedad: "Enfermedad diarreica aguda",
        estado: "datos_insuficientes",
        motivos: [
          "Complete los registros sanitarios indicados para estimar el modelo automáticamente",
        ],
        datos_faltantes: ["cantidad_recuperados", "historial_minimo_4_fechas"],
        observado: [
          {
            fecha: "2026-11-16",
            poblacion: 300,
            infectados: 4,
            recuperados: null,
            susceptibles: null,
            registro_casos_id: "507f1f77bcf86cd799439099",
            registro_poblacion_id: "507f1f77bcf86cd799439022",
          },
        ],
        proyeccion: [],
        parametros_estimados: null,
        resumen: null,
      },
      {
        enfermedad: "Dermatitis",
        estado: "datos_incompatibles",
        motivos: [
          "La serie implica reinfecciones, entradas o correcciones incompatibles con SIR cerrado",
        ],
        datos_faltantes: [],
        observado: [],
        proyeccion: [],
        parametros_estimados: null,
        resumen: null,
      },
      {
        enfermedad: "Conjuntivitis",
        estado: "sin_casos_activos",
        motivos: [
          "El último registro no tiene casos activos; SIR no estima la introducción de nuevos contagios externos",
        ],
        datos_faltantes: [],
        observado: [],
        proyeccion: [],
        parametros_estimados: null,
        resumen: null,
      },
    ],
    page: 1,
    page_size: 20,
    total: 4,
    total_pages: 1,
    has_next: false,
    has_previous: false,
  },
};

describe("Laboratorio SIR automático (/albergue/modelo-sir)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("consulta automáticamente GET /resultados sin pedir N, S, I, R, beta ni gamma manuales, y renderiza los 4 estados funcionales", async () => {
    const gateway: SIRGateway = {
      consultarResultados: vi.fn(async () => resultadoCompleto),
    };

    render(<ModeloSIRPage gateway={gateway} />);

    expect(
      await screen.findByText("[DEMO] Albergue San José")
    ).toBeInTheDocument();

    expect(gateway.consultarResultados).toHaveBeenCalledWith({
      page: 1,
      page_size: 20,
      enfermedad: undefined,
    });

    // No existen inputs manuales de parámetros ni botones PoC
    expect(
      screen.queryByRole("button", { name: /Cargar ejemplo PoC/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Población total \(N\)/i)
    ).not.toBeInTheDocument();

    // Estado 1: estimacion_disponible con gráfica, máximo en horizonte y parámetros estimados de solo lectura
    expect(
      screen.getByText(/Máximo de infectados en el horizonte/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/38,6 personas/i)).toBeInTheDocument();
    expect(screen.getByText(/0,4215 \/ día/i)).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: /Trayectoria S \/ I \/ R · Infección respiratoria aguda/i,
      })
    ).toBeInTheDocument();

    // Estado 2: datos_insuficientes con enlaces a registro de población y enfermedades
    expect(
      screen.getByText(
        /Falta informar la cantidad de personas recuperadas observadas/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Registrar casos y recuperados/i })
    ).toHaveAttribute("href", "/albergue/enfermedades");

    // Estado 3: datos_incompatibles
    expect(
      screen.getByText(/La serie implica reinfecciones/i)
    ).toBeInTheDocument();

    // Estado 4: sin_casos_activos
    expect(
      screen.getByText(/no estima la introducción de nuevos contagios externos/i)
    ).toBeInTheDocument();
  });

  it("permite filtrar por nombre de enfermedad en el servidor y paginar resultados", async () => {
    const gateway: SIRGateway = {
      consultarResultados: vi.fn(async () => resultadoCompleto),
    };

    render(<ModeloSIRPage gateway={gateway} />);
    await screen.findByText("[DEMO] Albergue San José");

    fireEvent.change(screen.getByLabelText("Filtrar por enfermedad"), {
      target: { value: "Dermatitis" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Filtrar" }));

    await waitFor(() => {
      expect(gateway.consultarResultados).toHaveBeenCalledWith({
        page: 1,
        page_size: 20,
        enfermedad: "Dermatitis",
      });
    });
  });

  it("muestra estado vacío raíz y datos_faltantes cuando el albergue no tiene enfermedades registradas", async () => {
    const gateway: SIRGateway = {
      consultarResultados: vi.fn(async () => ({
        ...resultadoCompleto,
        poblacion_actual: null,
        fecha_poblacion: null,
        datos_faltantes: ["poblacion_actual", "casos_enfermedades"],
        resultados: {
          items: [],
          page: 1,
          page_size: 20,
          total: 0,
          total_pages: 0,
          has_next: false,
          has_previous: false,
        },
      })),
    };

    render(<ModeloSIRPage gateway={gateway} />);

    expect(
      await screen.findByText(
        /Falta registrar el conteo de población vigente del albergue/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Sin registro")).toBeInTheDocument();
  });
});
