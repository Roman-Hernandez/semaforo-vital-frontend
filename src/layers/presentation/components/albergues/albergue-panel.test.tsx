import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AlberguePanel } from "./albergue-panel";
import { AlberguesError } from "@/layers/application/services/albergues-service";
import { paginaVacia } from "@/layers/application/services/paginacion";
import type { Albergue } from "@/layers/domain/albergues/albergue";

vi.mock("@/components/shared/SelectorCoordenadasMapa", () => ({ SelectorCoordenadasMapa: ({ onChange }: { onChange: (lat: string, lng: string) => void }) => <button type="button" onClick={() => onChange("4.81", "-75.69")}>Elegir ubicación</button> }));
const albergue: Albergue = { id: "a1", nombre: "Esperanza", codigo: "ALB-001", departamento: "Risaralda", municipio: "Pereira", direccion: "Calle 1", latitud: 4.81, longitud: -75.69, capacidadInstalada: 100, poblacionActual: 0, activo: true, administrador: null, riesgo: null, creadoEn: "2026-11-17" };
function props() { return { modo: "consultar" as const, albergue, puedeAdministrar: true, confirmandoEstado: false, cambiandoEstado: false, errorEstado: "", onModoChange: vi.fn(), onGuardar: vi.fn<() => Promise<void>>().mockResolvedValue(undefined), onCancelar: vi.fn(), onConfirmandoEstadoChange: vi.fn(), onCambiarEstado: vi.fn() }; }
describe("Panel de albergue", () => {
  it("no muestra panel sin selección y permite consultar, editar y cerrar", () => {
    const p = props(); const { rerender, container } = render(<AlberguePanel {...p} albergue={null} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<AlberguePanel {...p} />);
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect(p.onModoChange).toHaveBeenCalledWith("editar");
    fireEvent.click(screen.getByRole("button", { name: "Cerrar panel" }));
    expect(p.onCancelar).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Desactivar albergue" }));
    expect(p.onConfirmandoEstadoChange).toHaveBeenCalledWith(true);
  });
  it.each([true])("confirma cambios de estado activo=%s y presenta errores", (activo) => {
    const p = props(); render(<AlberguePanel {...p} albergue={{ ...albergue, activo, creadoEn: "", poblacionActual: null }} confirmandoEstado errorEstado="No se pudo cambiar" />);
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo cambiar");
    fireEvent.click(screen.getByRole("button", { name: activo ? "Desactivar" : "Reactivar" }));
    expect(p.onCambiarEstado).toHaveBeenCalledWith(expect.objectContaining({ activo }));
    fireEvent.click(screen.getByRole("button", { name: activo ? "Mantener activo" : "Cancelar" }));
    expect(p.onConfirmandoEstadoChange).toHaveBeenCalledWith(false);
  });
  it("muestra carga y ausencia de historiales, y permite filtrar registros", () => {
    const p = props(); const onConsultaRegistrosChange = vi.fn();
    const { rerender } = render(<AlberguePanel {...p} cargandoRegistros />);
    expect(screen.getByText("Cargando registros del albergue…")).toBeInTheDocument();
    rerender(<AlberguePanel {...p} registrosGlobales={{ condiciones: paginaVacia(), enfermedades: paginaVacia(), intervenciones: paginaVacia() }} onConsultaRegistrosChange={onConsultaRegistrosChange} consultaRegistros={{ page: 2 }} />);
    expect(screen.getByText("Sin registros sanitarios.")).toBeInTheDocument();
    expect(screen.getByText("Sin casos registrados.")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "IRA" } });
    expect(onConsultaRegistrosChange).toHaveBeenCalledWith({ page: 1, q: "IRA" });
  });
  it.each([new AlberguesError(422, "Nombre duplicado", { nombre: "Ya existe" }), new Error("fallo")])("conserva el formulario ante un fallo al guardar: %s", async (error) => {
    const p = props(); p.onGuardar.mockRejectedValue(error);
    render(<AlberguePanel {...p} modo="editar" />);
    fireEvent.change(screen.getByLabelText(/Nombre del albergue/), { target: { value: "Nombre nuevo" } });
    fireEvent.click(screen.getByRole("button", { name: "Elegir ubicación" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() => expect(p.onGuardar).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.getByText(error instanceof AlberguesError ? "Nombre duplicado" : "Ocurrió un error inesperado. Inténtalo nuevamente.")).toBeInTheDocument());
    expect(screen.getByLabelText(/Nombre del albergue/)).toHaveValue("Nombre nuevo");
  });
  it("valida campos obligatorios antes de guardar un albergue nuevo", () => {
    const p = props(); render(<AlberguePanel {...p} modo="registrar" albergue={null} />);
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(p.onGuardar).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Nombre del albergue/)).toHaveAttribute("aria-invalid", "true");
    fireEvent.change(screen.getByLabelText(/Nombre del albergue/), { target: { value: "Nuevo" } });
    expect(screen.getByLabelText(/Nombre del albergue/)).not.toHaveAttribute("aria-invalid");
  });
});
