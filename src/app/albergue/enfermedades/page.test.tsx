import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EnfermedadesPage from "@/layers/presentation/pages/enfermedades-page";
import type { EnfermedadesGateway } from "@/layers/application/services/registros-sanitarios-service";

function crearGatewayMock(): EnfermedadesGateway {
  return {
    listar: vi.fn(async () => ({
      items: [
        {
          id: "enf-1",
          fecha: "2026-11-16",
          enfermedad: "Infección respiratoria aguda",
          cantidadCasosActivos: 5,
          cantidadRecuperados: null,
          observaciones: "Seguimiento activo",
        },
      ],
      page: 1,
      page_size: 20,
      total: 1,
      total_pages: 1,
      has_next: false,
      has_previous: false,
    })),
    crear: vi.fn(async (entrada) => ({
      id: "enf-2",
      fecha: entrada.fecha,
      enfermedad: entrada.enfermedad,
      cantidadCasosActivos: entrada.cantidadCasosActivos,
      cantidadRecuperados: entrada.cantidadRecuperados ?? null,
      observaciones: entrada.observaciones ?? "",
    })),
    actualizar: vi.fn(async (id, entrada) => ({
      id,
      fecha: entrada.fecha,
      enfermedad: entrada.enfermedad,
      cantidadCasosActivos: entrada.cantidadCasosActivos,
      cantidadRecuperados: entrada.cantidadRecuperados ?? null,
      observaciones: entrada.observaciones ?? "",
    })),
  };
}

describe("Enfermedades (/albergue/enfermedades)", () => {
  it("lista los casos paginados conservando null en recuperados y permite registrar con o sin cantidad_recuperados", async () => {
    const gateway = crearGatewayMock();
    render(<EnfermedadesPage gateway={gateway} hoy="2026-11-17" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Enfermedades y casos" })
    ).toBeInTheDocument();

    expect(await screen.findByText("Seguimiento activo")).toBeInTheDocument();
    // El registro con cantidadRecuperados=null muestra "Sin dato", no "0"
    expect(screen.getByText("Sin dato")).toBeInTheDocument();

    // El input de recuperados inicia vacío (no en 0)
    const inputRecuperados = screen.getByLabelText(
      /Personas recuperadas \(opcional\)/i
    ) as HTMLInputElement;
    expect(inputRecuperados.value).toBe("");

    fireEvent.change(screen.getByLabelText(/Cantidad de casos activos \*/i), {
      target: { value: "3" },
    });
    fireEvent.change(inputRecuperados, {
      target: { value: "8" },
    });
    fireEvent.click(screen.getByRole("button", { name: /guardar registro/i }));

    await waitFor(() => {
      expect(gateway.crear).toHaveBeenCalledWith(
        expect.objectContaining({
          cantidadCasosActivos: 3,
          cantidadRecuperados: 8,
        })
      );
    });
  });
});
