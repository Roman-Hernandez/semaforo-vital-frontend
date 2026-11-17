import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AlberguesLista, FILTROS_INICIALES } from "./albergues-lista";
import { paginaVacia } from "@/layers/application/services/paginacion";
import type { Albergue } from "@/layers/domain/albergues/albergue";

export const albergue: Albergue = { id: "a1", nombre: "Esperanza", codigo: "ALB-001", departamento: "Risaralda", municipio: "Pereira", direccion: "Calle 1", latitud: 4.81, longitud: -75.69, capacidadInstalada: 100, poblacionActual: 0, activo: true, administrador: null, riesgo: null, creadoEn: "2026-11-17" };
function props() {
  return { estadoCarga: "listo" as const, mensajeError: "Sin conexión", totalRegistrados: 1, totalActivos: 1, pagina: { ...paginaVacia<Albergue>(), items: [albergue], total: 1, total_pages: 1 }, filtros: FILTROS_INICIALES, seleccionadoId: null, puedeAdministrar: true, onFiltrosChange: vi.fn(), onPaginaChange: vi.fn(), onPageSizeChange: vi.fn(), onConsultar: vi.fn(), onEditar: vi.fn(), onCambiarEstado: vi.fn(), onReintentar: vi.fn(), onRegistrar: vi.fn() };
}
describe("Listado de albergues: estados y acciones", () => {
  it("muestra carga, fallo recuperable y registro inicial", () => {
    const p = props(); const { rerender } = render(<AlberguesLista {...p} estadoCarga="cargando" />);
    expect(screen.getByRole("status")).toHaveTextContent("Cargando");
    rerender(<AlberguesLista {...p} estadoCarga="error" />);
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(p.onReintentar).toHaveBeenCalledOnce();
    rerender(<AlberguesLista {...p} pagina={paginaVacia()} totalRegistrados={0} />);
    fireEvent.click(screen.getByRole("button", { name: "Registrar albergue" }));
    expect(p.onRegistrar).toHaveBeenCalledOnce();
    rerender(<AlberguesLista {...p} pagina={paginaVacia()} filtros={{ ...FILTROS_INICIALES, busqueda: "inexistente" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(p.onFiltrosChange).toHaveBeenCalledWith(FILTROS_INICIALES);
  });
  it("ofrece consulta y edición y cierra menús con Escape o clic exterior", () => {
    const p = props(); render(<AlberguesLista {...p} seleccionadoId="a1" />);
    fireEvent.click(screen.getAllByRole("button", { name: "Consultar Esperanza" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Editar Esperanza" })[0]);
    expect(p.onConsultar).toHaveBeenCalledWith(albergue);
    expect(p.onEditar).toHaveBeenCalledWith(albergue);
    const menu = screen.getByRole("button", { name: "Más acciones para Esperanza" });
    fireEvent.click(menu);
    fireEvent.keyDown(document, { key: "Enter" });
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.mouseDown(menu);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    fireEvent.click(menu); fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    fireEvent.click(menu); fireEvent.click(screen.getByRole("menuitem"));
    expect(p.onCambiarEstado).toHaveBeenCalledWith(albergue);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
  it("respeta acceso de solo consulta y diferencia cero de población desconocida", () => {
    const p = props(); const { rerender } = render(<AlberguesLista {...p} puedeAdministrar={false} />);
    expect(screen.queryByRole("button", { name: "Editar Esperanza" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Más acciones para Esperanza" })).not.toBeInTheDocument();
    rerender(<AlberguesLista {...p} pagina={{ ...p.pagina, items: [{ ...albergue, activo: false, poblacionActual: null }] }} />);
    expect(screen.getAllByText("Sin dato").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Más acciones para Esperanza" })).not.toBeInTheDocument();
  });
  it("envía los filtros y limpia fechas sin alterar otros campos", () => {
    const p = props(); render(<AlberguesLista {...p} filtros={{ ...FILTROS_INICIALES, desde: "2026-11-01", hasta: "2026-11-17" }} />);
    fireEvent.change(screen.getByLabelText("Filtrar desde fecha"), { target: { value: "2026-11-02" } });
    expect(p.onFiltrosChange).toHaveBeenCalledWith(expect.objectContaining({ desde: "2026-11-02" }));
    fireEvent.change(screen.getByLabelText("Filtrar hasta fecha"), { target: { value: "2026-11-16" } });
    expect(p.onFiltrosChange).toHaveBeenCalledWith(expect.objectContaining({ hasta: "2026-11-16" }));
    fireEvent.click(screen.getByRole("button", { name: "Limpiar" }));
    expect(p.onFiltrosChange).toHaveBeenCalledWith(FILTROS_INICIALES);
  });
});
