import { describe, expect, it } from "vitest";
import {
  DESCRIPCION_MAXIMA,
  OBSERVACIONES_MAXIMA,
  formatearFecha,
  hoyEnBogota,
  normalizarIntervencion,
  ordenarIntervenciones,
  validarIntervencion,
  type Intervencion,
  type IntervencionEntrada,
} from "./intervencion";

const HOY = "2026-11-15";

const valida: IntervencionEntrada = {
  tipo: "Higiene",
  descripcion: "Entrega de kits de aseo a las familias.",
  observaciones: "",
  fecha: "2026-11-14",
};

describe("Validación de intervenciones", () => {
  it("acepta una intervención completa", () => {
    expect(validarIntervencion(valida, HOY)).toEqual({});
  });

  it("exige tipo, descripción y fecha", () => {
    expect(validarIntervencion({ tipo: "", descripcion: " ", observaciones: "", fecha: "" }, HOY)).toEqual({
      tipo: "Selecciona el tipo de intervención.",
      descripcion: "La descripción es obligatoria.",
      fecha: "La fecha de realización es obligatoria.",
    });
  });

  it("valida la longitud de la descripción y las observaciones", () => {
    expect(validarIntervencion({ ...valida, descripcion: "Corta" }, HOY).descripcion).toMatch(/al menos 10/);
    expect(
      validarIntervencion({ ...valida, descripcion: "x".repeat(DESCRIPCION_MAXIMA + 1) }, HOY).descripcion
    ).toMatch(/no puede superar/);
    expect(
      validarIntervencion({ ...valida, observaciones: "x".repeat(OBSERVACIONES_MAXIMA + 1) }, HOY).observaciones
    ).toMatch(/no pueden superar/);
  });

  it("rechaza fechas inválidas o futuras", () => {
    expect(validarIntervencion({ ...valida, fecha: "2026-02-30" }, HOY).fecha).toBe("Ingresa una fecha válida.");
    expect(validarIntervencion({ ...valida, fecha: "15/11/2026" }, HOY).fecha).toBe("Ingresa una fecha válida.");
    expect(validarIntervencion({ ...valida, fecha: "2026-11-16" }, HOY).fecha).toBe(
      "La fecha no puede ser posterior a hoy."
    );
    expect(validarIntervencion({ ...valida, fecha: HOY }, HOY)).toEqual({});
  });
});

describe("Utilidades de intervenciones", () => {
  it("calcula la fecha de hoy en Colombia", () => {
    expect(hoyEnBogota(new Date("2026-11-16T03:00:00Z"))).toBe("2026-11-15");
  });

  it("formatea fechas para mostrar", () => {
    expect(formatearFecha("2026-11-05")).toBe("5 nov 2026");
    expect(formatearFecha("")).toBe("Sin fecha");
  });

  it("limpia espacios antes de enviar", () => {
    expect(normalizarIntervencion({ tipo: " Higiene ", descripcion: " Algo largo ", observaciones: " ", fecha: " 2026-11-01 " })).toEqual({
      tipo: "Higiene",
      descripcion: "Algo largo",
      observaciones: "",
      fecha: "2026-11-01",
    });
  });

  it("ordena de la más reciente a la más antigua", () => {
    const base: Omit<Intervencion, "id" | "fecha" | "registradoEn"> = { tipo: "Higiene", descripcion: "d", observaciones: "" };
    const lista: Intervencion[] = [
      { ...base, id: "a", fecha: "2026-11-01", registradoEn: "1" },
      { ...base, id: "b", fecha: "2026-11-10", registradoEn: "1" },
      { ...base, id: "c", fecha: "2026-11-10", registradoEn: "2" },
    ];

    expect(ordenarIntervenciones(lista).map((i) => i.id)).toEqual(["c", "b", "a"]);
  });
});
