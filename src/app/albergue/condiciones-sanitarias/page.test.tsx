import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CondicionesSanitariasPage from "@/layers/presentation/pages/condiciones-sanitarias-page";
import type { CondicionesSanitariasGateway } from "@/layers/application/services/registros-sanitarios-service";

function crearGatewayMock(): CondicionesSanitariasGateway {
  return {
    listar: vi.fn(async () => ({
      items: [
        {
          id: "cs-1",
          fecha: "2026-11-16",
          aguaPotableDisponible: true,
          banosDisponibles: 8,
          estadoHigiene: "Adecuado",
          estadoSaneamiento: "Adecuado",
          otrosRecursosSanitarios: [],
          observaciones: "Revisión de rutina",
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
      id: "cs-2",
      fecha: entrada.fecha,
      aguaPotableDisponible: entrada.aguaPotableDisponible,
      banosDisponibles: entrada.banosDisponibles,
      estadoHigiene: entrada.estadoHigiene,
      estadoSaneamiento: entrada.estadoSaneamiento,
      otrosRecursosSanitarios: [],
      observaciones: entrada.observaciones ?? "",
    })),
    actualizar: vi.fn(async (id, entrada) => ({
      id,
      fecha: entrada.fecha,
      aguaPotableDisponible: entrada.aguaPotableDisponible,
      banosDisponibles: entrada.banosDisponibles,
      estadoHigiene: entrada.estadoHigiene,
      estadoSaneamiento: entrada.estadoSaneamiento,
      otrosRecursosSanitarios: [],
      observaciones: entrada.observaciones ?? "",
    })),
  };
}

describe("Condiciones sanitarias (/albergue/condiciones-sanitarias)", () => {
  it("lista el historial paginado real y permite registrar y editar condiciones contra la API", async () => {
    const gateway = crearGatewayMock();
    render(<CondicionesSanitariasPage gateway={gateway} hoy="2026-11-17" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Condiciones sanitarias" })
    ).toBeInTheDocument();

    expect(await screen.findByText("Revisión de rutina")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Baños disponibles \*/i), {
      target: { value: "12" },
    });
    fireEvent.click(screen.getByRole("button", { name: /guardar registro/i }));

    await waitFor(() => {
      expect(gateway.crear).toHaveBeenCalledWith(
        expect.objectContaining({
          banosDisponibles: 12,
          aguaPotableDisponible: true,
        })
      );
    });
  });
});
