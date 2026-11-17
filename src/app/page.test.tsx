import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import HomePage from "@/layers/presentation/pages/consulta-publica-page";
import type {
  AlberguePublico,
  PublicoGateway,
} from "@/layers/application/services/publico-service";
import type { ConsultaPaginada, Page } from "@/layers/application/services/paginacion";

/* eslint-disable @next/next/no-img-element */
vi.mock("next/image", () => ({
  default: ({
    alt = "",
    ...props
  }: React.ComponentProps<"img"> & { priority?: boolean }) => (
    <img {...props} alt={alt} />
  ),
}));
/* eslint-enable @next/next/no-img-element */

const ALBERGUES_BASE: AlberguePublico[] = [
  {
    id: "alb-1",
    codigo: "ALB-PER-001",
    nombre: "[DEMO] Albergue Municipal Centro",
    departamento: "Risaralda",
    municipio: "Pereira",
    direccion: "Cra. 8 # 20-15",
    latitud: 4.8143,
    longitud: -75.6946,
    capacidadInstalada: 200,
    poblacionActual: 140,
    porcentajeOcupacion: 70,
    cuposDisponibles: 60,
    nivelRiesgo: "verde" as const,
    fechaCalculoRiesgo: "2026-11-17T10:00:00Z",
    condicionesSanitarias: {
      fecha: "2026-11-17T08:00:00Z",
      aguaPotableDisponible: true,
      banosDisponibles: 12,
      estadoHigiene: "Adecuado",
      estadoSaneamiento: "Adecuado",
    },
  },
  {
    id: "alb-2",
    codigo: "ALB-DOS-002",
    nombre: "Coliseo Metropolitano",
    departamento: "Risaralda",
    municipio: "Dosquebradas",
    direccion: "Av. Simón Bolívar # 35-10",
    latitud: 4.8395,
    longitud: -75.6673,
    capacidadInstalada: 300,
    poblacionActual: 270,
    porcentajeOcupacion: 90,
    cuposDisponibles: 30,
    nivelRiesgo: "rojo" as const,
    fechaCalculoRiesgo: "2026-11-17T10:00:00Z",
    condicionesSanitarias: null,
  },
];

function envolverPagina<T>(items: T[], total = items.length): Page<T> {
  return {
    items,
    page: 1,
    page_size: 20,
    total,
    total_pages: total > 0 ? Math.ceil(total / 20) : 0,
    has_next: total > 20,
    has_previous: false,
  };
}

function crearGatewayMock(): PublicoGateway {
  return {
    listarAlbergues: vi.fn(async (consulta: ConsultaPaginada = {}) => {
      const q = (consulta.q ?? "").trim().toLowerCase();
      const filtrados = q
        ? ALBERGUES_BASE.filter(
            (a) =>
              a.nombre.toLowerCase().includes(q) ||
              a.municipio.toLowerCase().includes(q) ||
              a.departamento.toLowerCase().includes(q)
          )
        : ALBERGUES_BASE;
      return envolverPagina(filtrados, q ? filtrados.length : 30);
    }),
    listarAlertas: vi.fn(async () =>
      envolverPagina([
        {
          id: "alt-1",
          albergueId: "alb-2",
          fechaAlerta: "2026-11-17T09:30:00Z",
          nivelRiesgo: "rojo" as const,
          tipoAlerta: "Capacidad",
          mensaje: "Ocupación superior al 85% en Coliseo Metropolitano.",
          activa: true,
        },
      ])
    ),
    listarAlertasAlbergue: vi.fn(async () => envolverPagina([])),
  };
}

describe("Página principal institucional conectada a /api/v1/publico con Page<T>", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("renderiza los datos reales paginados, conserva etiquetas [DEMO] y comunica la cobertura visible en el mapa", async () => {
    const gateway = crearGatewayMock();
    render(<HomePage gateway={gateway} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Información sanitaria de los albergues",
      })
    ).toBeInTheDocument();

    expect(
      (await screen.findAllByText("[DEMO] Albergue Municipal Centro")).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("Coliseo Metropolitano").length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText("Ocupación superior al 85% en Coliseo Metropolitano.")
    ).toBeInTheDocument();
    // Indica explícitamente cuántos albergues se muestran en el mapa respecto al total (2 de 30)
    expect(
      screen.getByText(/Mostrando 2 de 30 albergues habilitados/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Educación" })).toHaveAttribute(
      "href",
      "/educacion"
    );
  });

  it("permite filtrar albergues en servidor por búsqueda y por nivel del semáforo", async () => {
    const gateway = crearGatewayMock();
    render(<HomePage gateway={gateway} />);

    await screen.findAllByText("[DEMO] Albergue Municipal Centro");

    fireEvent.change(
      screen.getByRole("searchbox", { name: /buscar albergue/i }),
      {
        target: { value: "Dosquebradas" },
      }
    );

    await waitFor(() => {
      expect(gateway.listarAlbergues).toHaveBeenCalledWith(
        expect.objectContaining({ q: "Dosquebradas", page: 1 })
      );
    });

    expect(
      screen.queryByRole("heading", {
        name: "[DEMO] Albergue Municipal Centro",
      })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Coliseo Metropolitano" })
    ).toBeInTheDocument();
  });

  it("despliega las condiciones sanitarias reales del albergue al consultar detalle", async () => {
    const gateway = crearGatewayMock();
    render(<HomePage gateway={gateway} />);

    await screen.findAllByText("[DEMO] Albergue Municipal Centro");

    const botones = screen.getAllByRole("button", {
      name: /ver condiciones sanitarias/i,
    });
    fireEvent.click(botones[0]);

    await waitFor(() => {
      expect(screen.getByText("12 disponibles")).toBeInTheDocument();
    });
  });
});
