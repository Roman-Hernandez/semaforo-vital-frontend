
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SemaforoVitalPage from "./page";

describe("SemaforoVitalPage", () => {
  it("debe renderizar el título de la página", () => {
    render(<SemaforoVitalPage />);

    expect(
      screen.getByRole("heading", { name: "Semáforo Vital" })
    ).toBeInTheDocument();
  });


    it("debe mostrar el nivel de riesgo actual", () => {
    render(<SemaforoVitalPage />);

    expect(
        screen.getByRole("heading", { name: "Riesgo bajo" })
    ).toBeInTheDocument();

    expect(
        screen.getByText("Nivel de riesgo actual")
    ).toBeInTheDocument();
    });


  it("debe mostrar las estadísticas del albergue", () => {
    render(<SemaforoVitalPage />);

    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("5", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("0", { exact: true })).toBeInTheDocument();

    expect(screen.getByText("Personas")).toBeInTheDocument();
    expect(screen.getByText("Casos registrados")).toBeInTheDocument();
    expect(screen.getByText("Alertas activas")).toBeInTheDocument();
  });

  it("debe mostrar los cinco factores de riesgo", () => {
    render(<SemaforoVitalPage />);

    expect(
      screen.getByText("Población y hacinamiento")
    ).toBeInTheDocument();

    expect(screen.getByText("Calidad del agua")).toBeInTheDocument();

    expect(
      screen.getByText("Condiciones sanitarias")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Casos de enfermedades")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Tendencia epidemiológica")
    ).toBeInTheDocument();
  });

  it("debe mostrar las recomendaciones", () => {
    render(<SemaforoVitalPage />);

    expect(
      screen.getByText("Recomendaciones")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Mantener la vigilancia diaria")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Cuidar la ocupación del albergue")
    ).toBeInTheDocument();
  });

  it("debe mostrar la explicación del nivel de riesgo", () => {
    render(<SemaforoVitalPage />);

    expect(
      screen.getByText("¿Por qué tenemos este nivel?")
    ).toBeInTheDocument();
  });

  it("debe contener los enlaces a alertas y predicciones", () => {
    render(<SemaforoVitalPage />);

    expect(
      screen.getByRole("link", { name: /ver alertas/i })
    ).toHaveAttribute("href", "/admin/alertas");

    expect(
      screen.getByRole("link", { name: /ver predicciones/i })
    ).toHaveAttribute("href", "/admin/predicciones");
  });

  it("debe mostrar el nombre del albergue", () => {
    render(<SemaforoVitalPage />);

    expect(
      screen.getByText("Albergue San José - Pereira")
    ).toBeInTheDocument();
  });
});
