
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HistorialPage from "./page";

describe("Historial del albergue - Semáforo Vital", () => {

  it("muestra el encabezado y la información del albergue", () => {
    render(<HistorialPage />);

    expect(
      screen.getByRole("heading", {
        name: "Historial del albergue",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Albergue San José · Pereira")
    ).toBeInTheDocument();
  });

  it("muestra las tarjetas de resumen", () => {
    render(<HistorialPage />);

    expect(screen.getByText("Registros totales")).toBeInTheDocument();
    expect(screen.getByText("Intervenciones realizadas")).toBeInTheDocument();
    expect(screen.getByText("Alertas generadas")).toBeInTheDocument();
    expect(screen.getByText("Última actualización")).toBeInTheDocument();

    expect(screen.getByText("128")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
   expect(screen.getAllByText("06 oct. 2026")).toHaveLength(2);
  });

  it("muestra los registros históricos en la tabla", () => {
    render(<HistorialPage />);

    const tabla = screen.getByRole("table");

    expect(
      within(tabla).getByText("Jornada de limpieza completada en áreas comunes.")
    ).toBeInTheDocument();

    expect(
      within(tabla).getByText("Ocupación actualizada: 120 personas de 200 plazas.")
    ).toBeInTheDocument();

    expect(
      within(tabla).getByText("Control de agua potable y revisión de residuos.")
    ).toBeInTheDocument();
  });

  it("permite buscar registros por descripción", () => {
    render(<HistorialPage />);

    const buscador = screen.getByRole("searchbox");

    fireEvent.change(buscador, {
      target: { value: "limpieza" },
    });

    const tabla = screen.getByRole("table");

    expect(
      within(tabla).getByText(
        "Jornada de limpieza completada en áreas comunes."
      )
    ).toBeInTheDocument();

    expect(
      within(tabla).queryByText(
        "Ocupación actualizada: 120 personas de 200 plazas."
      )
    ).not.toBeInTheDocument();
  });

  it("permite filtrar los registros por categoría", () => {
    render(<HistorialPage />);

    fireEvent.click(
      screen.getByRole("button", { name: "Población" })
    );

    const tabla = screen.getByRole("table");

    expect(
      within(tabla).getByText(
        "Ocupación actualizada: 120 personas de 200 plazas."
      )
    ).toBeInTheDocument();

    expect(
      within(tabla).queryByText(
        "Jornada de limpieza completada en áreas comunes."
      )
    ).not.toBeInTheDocument();
  });

  it("permite filtrar los registros por responsable", () => {
    render(<HistorialPage />);

    const selector = screen.getByLabelText("Responsable");

    fireEvent.change(selector, {
      target: { value: "Administración" },
    });

    const tabla = screen.getByRole("table");

    expect(
      within(tabla).getByText(
        "Ocupación actualizada: 120 personas de 200 plazas."
      )
    ).toBeInTheDocument();

    expect(
      within(tabla).queryByText(
        "Jornada de limpieza completada en áreas comunes."
      )
    ).not.toBeInTheDocument();
  });

  it("permite filtrar los registros por rango de fechas", () => {
    render(<HistorialPage />);

    fireEvent.change(screen.getByLabelText("Fecha desde"), {
      target: { value: "2026-10-05" },
    });

    fireEvent.change(screen.getByLabelText("Fecha hasta"), {
      target: { value: "2026-10-06" },
    });

    const tabla = screen.getByRole("table");

    expect(
      within(tabla).getByText(
        "Jornada de limpieza completada en áreas comunes."
      )
    ).toBeInTheDocument();

    expect(
      within(tabla).getByText(
        "Ocupación actualizada: 120 personas de 200 plazas."
      )
    ).toBeInTheDocument();

    expect(
      within(tabla).queryByText(
        "Control de agua potable y revisión de residuos."
      )
    ).not.toBeInTheDocument();
  });

  it("permite limpiar todos los filtros", () => {
    render(<HistorialPage />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "limpieza" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Limpiar" })
    );

    const tabla = screen.getByRole("table");

    expect(
      within(tabla).getByText(
        "Jornada de limpieza completada en áreas comunes."
      )
    ).toBeInTheDocument();

    expect(
      within(tabla).getByText(
        "Ocupación actualizada: 120 personas de 200 plazas."
      )
    ).toBeInTheDocument();

    expect(screen.getByRole("searchbox")).toHaveValue("");
  });

  it("muestra un mensaje cuando no existen registros", () => {
    render(<HistorialPage />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "registro inexistente" },
    });

    expect(
      screen.getByText(
        "No se encontraron registros con esos filtros."
      )
    ).toBeInTheDocument();

    expect(screen.getByText("0 resultados")).toBeInTheDocument();
  });

  it("muestra la línea de tiempo del historial", () => {
    render(<HistorialPage />);

    expect(
      screen.getByRole("heading", { name: "Línea de tiempo" })
    ).toBeInTheDocument();

    expect(screen.getAllByText("Ver detalle").length).toBeGreaterThan(0);
  });

  it("permite abrir el detalle de un registro", () => {
    render(<HistorialPage />);

    const botonesDetalle = screen.getAllByRole("button", {
      name: /ver detalle/i,
    });

    fireEvent.click(botonesDetalle[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    expect(
      screen.getByText("Registro histórico #001")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Información general")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Descripción del evento")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Trazabilidad del registro")
    ).toBeInTheDocument();
  });

  it("permite cerrar el detalle del registro", () => {
    render(<HistorialPage />);

    const botonesDetalle = screen.getAllByRole("button", {
      name: /ver detalle/i,
    });

    fireEvent.click(botonesDetalle[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Cerrar detalle",
      })[0]
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

});
