import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PoblacionPage from "@/layers/presentation/pages/poblacion-page";
import type { MiAlbergueGateway } from "@/layers/application/services/mi-albergue-service";

function crearGatewayMock(): MiAlbergueGateway {
  return {
    consultar: vi.fn(async () => ({
      albergue: {
        id: "alb-1",
        codigo: "ALB-PER-001",
        nombre: "Albergue San José",
        departamento: "Risaralda",
        municipio: "Pereira",
        direccion: "Cra. 7 # 19-45",
        latitud: 4.8143,
        longitud: -75.6946,
        capacidadInstalada: 200,
        activo: true,
        poblacionActual: 120,
        administrador: "María López",
        riesgo: null,
        creadoEn: "2026-09-18",
      },
      administrador: {
        id: "usr-1",
        nombre: "María",
        apellido: "López",
        email: "maria@semaforo.gob",
      },
    })),
    actualizar: vi.fn(),
    consultarDashboard: vi.fn(),
    consultarPoblacion: vi.fn(async () => ({
      poblacionActual: 120,
      porcentajeOcupacion: 60,
      cuposDisponibles: 80,
      ultimoRegistro: {
        id: "pop-1",
        fecha: "2026-11-16",
        poblacion: 120,
        creadoEn: "2026-11-16T10:00:00Z",
      },
    })),
    guardarPoblacion: vi.fn(async (fecha: string, poblacion: number) => ({
      id: "pop-2",
      fecha,
      poblacion,
      creadoEn: "2026-11-17T10:00:00Z",
    })),
    listarHistorialPoblacion: vi.fn(async () => ({
      items: [
        {
          id: "pop-1",
          fecha: "2026-11-16",
          poblacion: 120,
          creadoEn: "2026-11-16T10:00:00Z",
        },
      ],
      page: 1,
      page_size: 20,
      total: 90,
      total_pages: 5,
      has_next: true,
      has_previous: false,
    })),
  };
}

describe("Población del albergue (/albergue/poblacion)", () => {
  it("carga la ocupación y el historial paginado real sin campo q y envía PUT /api/v1/mi-albergue/poblacion", async () => {
    const gateway = crearGatewayMock();
    render(<PoblacionPage gateway={gateway} hoy="2026-11-17" />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Población del albergue",
      })
    ).toBeInTheDocument();

    expect(await screen.findAllByText("60%")).toHaveLength(2);
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Cantidad de personas alojadas/i), {
      target: { value: "145" },
    });
    fireEvent.change(screen.getByLabelText(/Fecha del registro/i), {
      target: { value: "2026-11-17" },
    });
    fireEvent.click(screen.getByRole("button", { name: /guardar registro/i }));

    await waitFor(() => {
      expect(gateway.guardarPoblacion).toHaveBeenCalledWith(
        "2026-11-17",
        145
      );
    });

    expect(
      await screen.findByText(
        "El registro de población se guardó correctamente."
      )
    ).toBeInTheDocument();
  });
});
