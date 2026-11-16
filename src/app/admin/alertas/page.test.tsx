
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AlertasPage from "./page";

describe("AlertasPage", () => {
  it("debe renderizar el título y la descripción", () => {
    render(<AlertasPage />);

    expect(
      screen.getByRole("heading", { name: "Alertas" })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Consulta y da seguimiento a las alertas sanitarias de tu albergue."
      )
    ).toBeInTheDocument();
  });

  it("debe mostrar los indicadores de alertas", () => {
    render(<AlertasPage />);

    expect(screen.getByText("Alertas activas")).toBeInTheDocument();
    expect(screen.getByText("Prioridad crítica")).toBeInTheDocument();
    expect(screen.getByText("Resueltas")).toBeInTheDocument();

    expect(screen.getByText("Sin alertas vigentes")).toBeInTheDocument();
    expect(screen.getByText("En los últimos 30 días")).toBeInTheDocument();
  });

  it("debe mostrar el mensaje cuando no hay alertas activas", () => {
    render(<AlertasPage />);

    expect(
      screen.getByRole("heading", { name: "Sin alertas activas" })
    ).toBeInTheDocument();
  });

  it("debe mostrar las pestañas de alertas activas e historial", () => {
    render(<AlertasPage />);

    expect(
      screen.getByRole("tab", { name: /Activas \(0\)/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("tab", { name: /Historial \(3\)/i })
    ).toBeInTheDocument();
  });

  it("debe mostrar las alertas del historial", () => {
    render(<AlertasPage />);

    expect(
      screen.getByText("Abastecimiento de agua restablecido")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Recolección de residuos normalizada")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Limpieza de zonas comunes completada")
    ).toBeInTheDocument();
  });

  it("debe mostrar los tipos y prioridades de las alertas", () => {
    render(<AlertasPage />);

    expect(screen.getAllByText("Agua").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Saneamiento").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Higiene").length).toBeGreaterThan(0);

    expect(screen.getAllByText("Alta").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Media").length).toBeGreaterThan(0);
  });

  it("debe permitir buscar alertas por título", () => {
    render(<AlertasPage />);

    const searchInput = screen.getByRole("searchbox", {
      name: "Buscar alertas por título o identificador",
    });

    fireEvent.change(searchInput, {
      target: { value: "Abastecimiento" },
    });

    expect(
      screen.getByText("Abastecimiento de agua restablecido")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Recolección de residuos normalizada")
    ).not.toBeInTheDocument();
  });

  it("debe permitir buscar alertas por identificador", () => {
    render(<AlertasPage />);

    const searchInput = screen.getByRole("searchbox", {
      name: "Buscar alertas por título o identificador",
    });

    fireEvent.change(searchInput, {
      target: { value: "ALT-002" },
    });

    expect(
      screen.getByText("Recolección de residuos normalizada")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Limpieza de zonas comunes completada")
    ).not.toBeInTheDocument();
  });

  it("debe filtrar las alertas por tipo", () => {
    render(<AlertasPage />);

    const typeFilter = screen.getByRole("combobox", {
      name: "Filtrar por tipo de alerta",
    });

    fireEvent.change(typeFilter, {
      target: { value: "Agua" },
    });

    expect(
      screen.getByText("Abastecimiento de agua restablecido")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Recolección de residuos normalizada")
    ).not.toBeInTheDocument();
  });

  it("debe mostrar el estado vacío al seleccionar alertas activas", () => {
    render(<AlertasPage />);

    fireEvent.click(screen.getByRole("tab", { name: /Activas/i }));

    expect(
      screen.getByText("No hay alertas activas")
    ).toBeInTheDocument();
  });

  it("debe permitir consultar el detalle de una alerta", () => {
    render(<AlertasPage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ver detalle de Abastecimiento de agua restablecido",
      })
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Abastecimiento de agua restablecido",
      })
    ).toBeInTheDocument();

    expect(screen.getByText("Descripción")).toBeInTheDocument();
    expect(
  screen.getAllByText(/Responsable:/).length
).toBeGreaterThan(0);
  });

  it("debe cerrar el detalle de una alerta", () => {
    render(<AlertasPage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ver detalle de Abastecimiento de agua restablecido",
      })
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Cerrar detalle" })
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("debe mostrar la información del último cierre verificado", () => {
    render(<AlertasPage />);

    expect(
      screen.getByRole("heading", {
        name: "Último cierre verificado",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Se verificó el suministro continuo de agua potable/)
    ).toBeInTheDocument();
  });

  it("debe mostrar la recomendación de vigilancia diaria", () => {
    render(<AlertasPage />);

    expect(
      screen.getByText("Mantén la vigilancia diaria")
    ).toBeInTheDocument();
  });

  it("debe mostrar el filtro de fechas", () => {
    render(<AlertasPage />);

    expect(
      screen.getByRole("combobox", { name: "Filtrar por fecha" })
    ).toBeInTheDocument();
  });

  it("debe mostrar el botón para exportar el historial", () => {
    render(<AlertasPage />);

    expect(
      screen.getByRole("button", { name: /Exportar historial/i })
    ).toBeEnabled();
  });
});
