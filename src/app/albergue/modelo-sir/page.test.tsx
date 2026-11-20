import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
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
        enfermedad: "Enfermedad diarreica aguda",
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
        parametros_estimados: null,
        parametros_referencia: { beta: 0.275, gamma: 0.1 },
        resumen: {
          pico_infectados_en_horizonte: 38.6,
          fecha_pico_en_horizonte: "2026-11-24",
          infectados_finales: 24.1,
          recuperados_finales: 100.7,
          r_efectivo_inicial: 2.013,
          error_maximo_poblacion: 1e-11,
        },
      },
    ],
    page: 1,
    page_size: 20,
    total: 1,
    total_pages: 1,
    has_next: false,
    has_previous: false,
  },
};

it("simula EDA solo al pulsar el botón y conserva la última corrida si cambia la población", async () => {
  const item = resultadoCompleto.resultados.items[0];
  const gateway: SIRGateway = {
    consultarResultados: vi.fn(async () => resultadoCompleto),
    simular: vi.fn()
      .mockResolvedValueOnce(resultadoCompleto)
      .mockResolvedValueOnce({
        ...resultadoCompleto,
        poblacion_actual: 270,
        resultados: {
          ...resultadoCompleto.resultados,
          items: [{
            ...item,
            estado: "datos_insuficientes",
            motivos: ["La población cambió. Actualiza el reporte de EDA para simular."],
            proyeccion: [],
            resumen: null,
          }],
        },
      }),
  };
  render(<ModeloSIRPage gateway={gateway} />);
  const boton = screen.getByRole("button", { name: "Simular 14 días" });
  expect(gateway.simular).not.toHaveBeenCalled();
  expect(gateway.consultarResultados).not.toHaveBeenCalled();

  fireEvent.click(boton);
  expect(await screen.findByText("Simulación disponible")).toBeInTheDocument();
  expect(gateway.simular).toHaveBeenCalledWith({ enfermedad: "Enfermedad diarreica aguda" });
  expect(screen.getByText("Tasas de referencia de estudios de norovirus")).toBeInTheDocument();
  expect(screen.getByText("≈ 24 personas")).toBeInTheDocument();
  expect(screen.getByText("≈ 101 personas")).toBeInTheDocument();

  const simulacion = screen.getByRole("tab", { name: "Simulación" });
  fireEvent.keyDown(simulacion, { key: "ArrowRight" });
  const guia = screen.getByRole("tabpanel", { name: "Cómo funciona el SIR" });
  expect(within(guia).getByText(/0,275 por día/)).toBeInTheDocument();
  expect(within(guia).getByText(/0,100 por día/)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Simular 14 días" })).not.toBeInTheDocument();
  fireEvent.click(simulacion);
  expect(screen.getByText("≈ 101 personas")).toBeInTheDocument();


  fireEvent.click(boton);
  expect(await screen.findByText(/La población cambió/)).toBeInTheDocument();
  expect(gateway.simular).toHaveBeenCalledTimes(2);
  expect(within(screen.getByRole("region", { name: "Datos de la corrida" }))
    .getByText("Población de la corrida · 300")).toBeInTheDocument();
});
