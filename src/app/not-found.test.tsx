import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFoundPage from "./not-found";

describe("Página de ruta no encontrada (404)", () => {
  it("renderiza el mensaje institucional 404 y enlaces de retorno", () => {
    render(<NotFoundPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /La página que buscas no está disponible/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /Ir a la página principal/i })
    ).toHaveAttribute("href", "/");
  });
});
