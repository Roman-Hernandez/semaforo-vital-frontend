import { describe, expect, it } from "vitest";
import {
  calcularRangoPagina,
  construirQueryPaginada,
  mapearPagina,
  paginaVacia,
} from "./paginacion";

describe("Contrato compartido de paginación (paginacion.ts)", () => {
  it("construye query con page y page_size por defecto sin enviar limite ni offset", () => {
    const query = construirQueryPaginada();
    expect(query).toBe("?page=1&page_size=20");
    expect(query).not.toContain("limite");
    expect(query).not.toContain("offset");
  });

  it("incluye q (recortado a 100 caracteres), desde, hasta y activo", () => {
    const query = construirQueryPaginada({
      page: 2,
      page_size: 50,
      q: "  Pereira  ",
      desde: "2026-10-01",
      hasta: "2026-11-17",
      activo: true,
    });
    expect(query).toBe(
      "?page=2&page_size=50&q=Pereira&desde=2026-10-01&hasta=2026-11-17&activo=true"
    );
  });

  it("omite q cuando permitirQ es false (ej. historial de población)", () => {
    const query = construirQueryPaginada(
      {
        page: 1,
        page_size: 20,
        q: "no-enviar",
        desde: "2026-11-01",
      },
      { permitirQ: false }
    );
    expect(query).toBe("?page=1&page_size=20&desde=2026-11-01");
    expect(query).not.toContain("q=");
  });

  it("calcula el rango visible y detecta páginas fuera de rango conservando total", () => {
    const paginaNormal = {
      items: ["a", "b"],
      page: 2,
      page_size: 10,
      total: 12,
      total_pages: 2,
      has_next: false,
      has_previous: true,
    };
    expect(calcularRangoPagina(paginaNormal)).toEqual({
      desde: 11,
      hasta: 12,
      fueraDeRango: false,
    });

    const fueraRango = {
      items: [],
      page: 5,
      page_size: 10,
      total: 12,
      total_pages: 2,
      has_next: false,
      has_previous: true,
    };
    expect(calcularRangoPagina(fueraRango)).toEqual({
      desde: 0,
      hasta: 0,
      fueraDeRango: true,
    });

    expect(calcularRangoPagina(paginaVacia())).toEqual({
      desde: 0,
      hasta: 0,
      fueraDeRango: false,
    });
  });

  it("mapea los elementos conservando los metadatos de Page<T>", () => {
    const entrada = {
      items: [1, 2, 3],
      page: 1,
      page_size: 20,
      total: 3,
      total_pages: 1,
      has_next: false,
      has_previous: false,
    };
    const resultado = mapearPagina(entrada, (n) => n * 10);
    expect(resultado.items).toEqual([10, 20, 30]);
    expect(resultado.total).toBe(3);
  });
});
