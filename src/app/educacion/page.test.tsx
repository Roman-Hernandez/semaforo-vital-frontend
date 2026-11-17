import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EducacionSanitariaPage from "./page";

describe("Página de Educación y Saneamiento (/educacion)", () => {
  it("renderiza la guía completa de estándares WASH, referencias bibliográficas y el footer con enlaces de redirección", () => {
    render(<EducacionSanitariaPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Guía de saneamiento básico y salud ambiental en albergues/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /1\. Abastecimiento y calidad de agua potable/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /2\. Disposición de excretas y baterías sanitarias/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Fuentes y referencias bibliográficas oficiales/i,
      })
    ).toBeInTheDocument();

    expect(screen.getAllByText(/Asociación Esfera/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /Quiénes somos/i })[0]
    ).toHaveAttribute("href", "/quienes-somos");
    expect(
      screen.getByRole("link", { name: /Términos de uso del sistema/i })
    ).toHaveAttribute("href", "/marco-legal#terminos-uso");
  });
});
