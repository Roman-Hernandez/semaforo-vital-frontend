import { describe, expect, it } from "vitest";
import {
  agruparPorEjecucion,
  describirModelo,
  formatearFechaHora,
  formatearProbabilidad,
  resumirEjecucion,
  type ResultadoRegresion,
} from "./resultado";

const modelo = { nombre: "Regresión logística", version: "2.0" };

function resultado(id: string, probabilidad: number, fechaEjecucion: string, conModelo = true): ResultadoRegresion {
  return {
    id,
    registro: `REG-${id}`,
    probabilidad,
    fechaEjecucion,
    clasificacion: probabilidad >= 0.5 ? "contagiado" : "no_contagiado",
    modelo: conModelo ? modelo : null,
  };
}

describe("Resultados de regresión logística", () => {
  it("formatea la probabilidad como porcentaje acotado", () => {
    expect(formatearProbabilidad(0.876)).toBe("88%");
    expect(formatearProbabilidad(1.4)).toBe("100%");
    expect(formatearProbabilidad(-0.2)).toBe("0%");
  });

  it("formatea la fecha de ejecución en hora de Colombia", () => {
    expect(formatearFechaHora("2026-11-14T13:30:00.000Z")).toBe("14 nov 2026 · 08:30");
    expect(formatearFechaHora("")).toBe("Fecha no disponible");
    expect(formatearFechaHora("no-es-fecha")).toBe("Fecha no disponible");
  });

  it("describe el modelo o indica que no está disponible", () => {
    expect(describirModelo(modelo)).toBe("Regresión logística · v2.0");
    expect(describirModelo(null)).toBe("Versión no disponible");
  });

  it("agrupa por ejecución, de la más reciente a la más antigua y por probabilidad", () => {
    const grupos = agruparPorEjecucion([
      resultado("a", 0.2, "2026-11-01T10:00:00Z", false),
      resultado("b", 0.3, "2026-11-10T10:00:00Z"),
      resultado("c", 0.9, "2026-11-10T10:00:00Z"),
    ]);

    expect(grupos).toHaveLength(2);
    expect(grupos[0].fechaEjecucion).toBe("2026-11-10T10:00:00Z");
    expect(grupos[0].resultados.map((r) => r.id)).toEqual(["c", "b"]);
    expect(grupos[1].modelo).toBeNull();
  });

  it("resume una ejecución", () => {
    const [grupo] = agruparPorEjecucion([
      resultado("a", 0.8, "2026-11-10T10:00:00Z"),
      resultado("b", 0.2, "2026-11-10T10:00:00Z"),
    ]);

    expect(resumirEjecucion(grupo)).toEqual({
      total: 2,
      contagiados: 1,
      noContagiados: 1,
      probabilidadPromedio: 0.5,
    });
    expect(resumirEjecucion({ ...grupo, resultados: [] }).probabilidadPromedio).toBe(0);
  });
});
