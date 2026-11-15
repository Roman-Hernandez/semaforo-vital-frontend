
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import ModeloSirPage from "./page";

describe("Página Modelo SIR", () => {
  it("debe renderizar el título de la página", () => {
    render(<ModeloSirPage />);

    expect(
      screen.getByRole("heading", { name: /modelo sir/i })
    ).toBeInTheDocument();
  });

  it("debe mostrar las cuatro tarjetas de indicadores", () => {
    render(<ModeloSirPage />);

    const indicadores = screen.getByRole("region", {
      name: /indicadores iniciales de la simulación/i,
    });

    expect(within(indicadores).getByText(/susceptibles \(s\)/i)).toBeInTheDocument();
    expect(within(indicadores).getByText(/infectados \(i\)/i)).toBeInTheDocument();
    expect(within(indicadores).getByText(/recuperados \(r\)/i)).toBeInTheDocument();
    expect(within(indicadores).getByText(/población total/i)).toBeInTheDocument();
  });

  it("debe mostrar los botones de ejecución y restablecimiento", () => {
    render(<ModeloSirPage />);

    expect(
      screen.getByRole("button", { name: /ejecutar simulación/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /restablecer/i })
    ).toBeInTheDocument();
  });

  it("debe permitir modificar los parámetros de la simulación", () => {
    render(<ModeloSirPage />);

    const beta = screen.getByLabelText(/β|beta/i);
    const gamma = screen.getByLabelText(/γ|gamma/i);
    const duration = screen.getByLabelText(/duración/i);

    fireEvent.change(beta, { target: { value: "0.40" } });
    fireEvent.change(gamma, { target: { value: "0.15" } });
    fireEvent.change(duration, { target: { value: "90" } });

    expect(beta).toHaveValue(0.4);
    expect(gamma).toHaveValue(0.15);
    expect(duration).toHaveValue(90);
  });

  it("debe ejecutar la simulación correctamente", () => {
    render(<ModeloSirPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /ejecutar simulación/i })
    );

    expect(
      screen.getByRole("status")
    ).toHaveTextContent(/simulación local ejecutada correctamente/i);

    expect(
      screen.getByRole("heading", { name: /resultados de la simulación/i })
    ).toBeInTheDocument();
  });

  it("debe restablecer los parámetros iniciales", () => {
    render(<ModeloSirPage />);

    const beta = screen.getByLabelText(/β|beta/i);
    const gamma = screen.getByLabelText(/γ|gamma/i);
    const duration = screen.getByLabelText(/duración/i);

    fireEvent.change(beta, { target: { value: "0.50" } });
    fireEvent.change(gamma, { target: { value: "0.20" } });
    fireEvent.change(duration, { target: { value: "90" } });

    fireEvent.click(
      screen.getByRole("button", { name: /restablecer/i })
    );

    expect(beta).toHaveValue(0.3);
    expect(gamma).toHaveValue(0.1);
    expect(duration).toHaveValue(60);
  });
});
