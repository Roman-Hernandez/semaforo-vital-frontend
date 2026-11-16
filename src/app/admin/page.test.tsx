
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import AdminDashboardPage from "./page";

describe("Dashboard del administrador - Semáforo Vital", () => {
  it("debe renderizar el encabezado del dashboard", () => {
    render(<AdminDashboardPage />);

    expect(
      screen.getByRole("heading", { name: "Resumen del albergue" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Situación sanitaria y prioridades para el turno de hoy.",
      ),
    ).toBeInTheDocument();
  });

  it("debe mostrar las cuatro tarjetas de indicadores", () => {
    render(<AdminDashboardPage />);

    const indicadores = screen.getByRole("region", {
      name: "Indicadores del albergue",
    });

    expect(
      within(indicadores).getByText("Población actual"),
    ).toBeInTheDocument();

    expect(
      within(indicadores).getByText("Capacidad"),
    ).toBeInTheDocument();

    expect(
      within(indicadores).getByText("Semáforo Vital"),
    ).toBeInTheDocument();

    expect(
      within(indicadores).getByText("Alertas activas"),
    ).toBeInTheDocument();
  });

  it("debe mostrar los valores de población y capacidad", () => {
    render(<AdminDashboardPage />);

    expect(screen.getByText("245")).toBeInTheDocument();
    expect(screen.getByText("300")).toBeInTheDocument();
    expect(screen.getByText("92 familias alojadas")).toBeInTheDocument();
    expect(
      screen.getByText(/55 plazas libres/i),
    ).toBeInTheDocument();
  });

  it("debe mostrar el nivel actual del Semáforo Vital", () => {
    render(<AdminDashboardPage />);

    expect(screen.getByText("AMARILLO")).toBeInTheDocument();

    expect(
      screen.getByText("Precaución · Reforzar la prevención"),
    ).toBeInTheDocument();
  });

  it("debe mostrar la alerta sanitaria prioritaria", () => {
    render(<AdminDashboardPage />);

    const alerta = screen.getByRole("region", {
      name: "Alerta sanitaria prioritaria",
    });

    expect(
      within(alerta).getByText(
        "Atención del turno: saneamiento e higiene",
      ),
    ).toBeInTheDocument();

    expect(
      within(alerta).getByText(
        /Rehabilitar 2 sanitarios y reponer jabón/i,
      ),
    ).toBeInTheDocument();

    expect(
      within(alerta).getByRole("link", {
        name: /Revisar alertas/i,
      }),
    ).toHaveAttribute("href", "/admin/alertas");
  });

  it("debe mostrar los cuatro indicadores del estado sanitario", () => {
    render(<AdminDashboardPage />);

    expect(
      screen.getByRole("heading", { name: "Estado sanitario" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Agua potable")).toBeInTheDocument();
    expect(screen.getByText("Saneamiento")).toBeInTheDocument();
    expect(screen.getByText("Higiene")).toBeInTheDocument();
    expect(screen.getByText("Casos registrados")).toBeInTheDocument();
  });

  it("debe mostrar los valores y estados sanitarios", () => {
    render(<AdminDashboardPage />);

    expect(
      screen.getByText("18 L / persona / día"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("10 de 12 sanitarios"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("3 de 4 puntos equipados"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("8 casos activos"),
    ).toBeInTheDocument();

const sanitarySection = screen
  .getByRole("heading", { name: "Estado sanitario" })
  .closest("section");

expect(sanitarySection).not.toBeNull();

expect(
  within(sanitarySection!).getByText(/Adecuada/),
).toBeInTheDocument();

expect(
  within(sanitarySection!).getAllByText(/Atención/),
).toHaveLength(2);

expect(
  within(sanitarySection!).getByText(/En seguimiento/),
).toBeInTheDocument();
  });

  it("debe mostrar la gráfica de evolución epidemiológica", () => {
    render(<AdminDashboardPage />);

    expect(
      screen.getByRole("heading", {
        name: "Evolución epidemiológica",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: /Gráfica ilustrativa de casos nuevos por día/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("17 casos nuevos en 7 días"),
    ).toBeInTheDocument();
  });

  it("debe mostrar la predicción de riesgo", () => {
    render(<AdminDashboardPage />);

    expect(
      screen.getByRole("heading", { name: "Predicción de riesgo" }),
    ).toBeInTheDocument();

    expect(screen.getByText(/MODERADO/)).toBeInTheDocument();
    expect(screen.getByText("Próximas 48 h")).toBeInTheDocument();

    expect(
      screen.getByText(/podrían favorecer nuevos casos/i),
    ).toBeInTheDocument();
  });

  it("debe mostrar las últimas intervenciones y el enlace al historial", () => {
    render(<AdminDashboardPage />);

    expect(
      screen.getByRole("heading", { name: "Últimas intervenciones" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Desinfección de áreas comunes"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Entrega de 60 kits de higiene"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Control de calidad del agua"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /Ver historial/i }),
    ).toHaveAttribute("href", "/admin/historial");
  });

  it("debe mostrar el botón para registrar una intervención", () => {
    render(<AdminDashboardPage />);

    expect(
      screen.getByRole("button", {
        name: /Registrar intervención/i,
      }),
    ).toBeInTheDocument();
  });

  it("debe indicar que los datos son demostrativos", () => {
    render(<AdminDashboardPage />);

    expect(screen.getByText("Datos demostrativos")).toBeInTheDocument();
    expect(
      screen.getByText(/Estimación ilustrativa/i),
    ).toBeInTheDocument();
  });
});
