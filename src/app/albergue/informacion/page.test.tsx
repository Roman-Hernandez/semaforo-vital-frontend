import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InformacionAlberguePage from "./page";
import { MiAlbergueContext } from "@/layers/presentation/hooks/use-mi-albergue";
import { miAlbergueGateway } from "@/layers/application/services/mi-albergue-service";

const base = {
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
};

describe("Información del albergue (/albergue/informacion)", () => {
  it("muestra la ficha técnica y permite actualizar capacidad y ubicación", async () => {
    const setDatos = vi.fn();
    vi.spyOn(miAlbergueGateway, "actualizar").mockResolvedValueOnce({
      ...base.albergue,
      capacidadInstalada: 250,
    });

    render(
      <MiAlbergueContext.Provider
        value={{ datos: base, setDatos, error: "", recargar: vi.fn() }}
      >
        <InformacionAlberguePage />
      </MiAlbergueContext.Provider>
    );

    expect(screen.getByRole("heading", { level: 1, name: "Información del albergue" })).toBeInTheDocument();
    expect(screen.getByText("Albergue San José")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Editar información" }));

    const inputCapacidad = screen.getByLabelText("Capacidad máxima");
    fireEvent.change(inputCapacidad, { target: { value: "250" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(miAlbergueGateway.actualizar).toHaveBeenCalled();
    });
    expect(
      await screen.findByText("La información del albergue se actualizó correctamente.")
    ).toBeInTheDocument();
  });
});
