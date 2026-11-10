
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import HomePage from "./page";

// Evita problemas con el componente Image de Next.js durante las pruebas.
vi.mock("next/image", () => ({
  default: ({
    priority,
    alt = "",
    ...props
  }: React.ComponentProps<"img"> & { priority?: boolean }) => (
    <img {...props} alt={alt} />
  ),
}));

describe("Página principal pública - Semáforo Vital", () => {
  it("debe renderizar correctamente la página principal", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "Semáforo Vital" })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Información sanitaria de los albergues")
    ).toBeInTheDocument();
  });

it("debe mostrar los tres niveles de riesgo", () => {
  render(<HomePage />);

  expect(screen.getAllByText(/Riesgo\s+bajo/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Riesgo\s+medio/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Riesgo\s+crítico/).length).toBeGreaterThan(0);
});

  it("debe mostrar inicialmente cuatro albergues", () => {
    render(<HomePage />);

    expect(
      screen.getByText("Albergue Escuela Central")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Polideportivo Norte")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Centro Comunal La Esperanza")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Instituto Técnico Sur")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Coliseo Municipal")
    ).not.toBeInTheDocument();
  });

  it("debe mostrar los demás albergues al hacer clic en Ver más", () => {
    render(<HomePage />);

    fireEvent.click(
      screen.getByRole("button", { name: /ver más albergues/i })
    );

    expect(
      screen.getByText("Coliseo Municipal")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Centro Comunitario El Bosque")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Escuela Rural San José")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Centro Deportivo La Unión")
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /ver más albergues/i })
    ).not.toBeInTheDocument();
  });

  it("debe desplegar los detalles de un albergue", () => {
    render(<HomePage />);

    const botonesDetalles = screen.getAllByRole("button", {
      name: /ver detalles/i,
    });

    fireEvent.click(botonesDetalles[0]);

    expect(
      screen.getByText("Información del albergue")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Condiciones sanitarias")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Agua potable")
    ).toBeInTheDocument();
  });

  it("debe abrir las recomendaciones de una alerta sanitaria", () => {
    render(<HomePage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /ver recomendaciones/i,
      })
    );

    expect(
      screen.getByRole("dialog")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Recomendaciones para el consumo de agua segura"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText("Hierve el agua antes de consumirla.")
    ).toBeInTheDocument();
  });

  it("debe cerrar el modal de recomendaciones", () => {
    render(<HomePage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /ver recomendaciones/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Cerrar recomendaciones" })
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("debe abrir un recurso educativo", () => {
    render(<HomePage />);

    fireEvent.click(
      screen.getAllByRole("button", {
        name: /consultar recurso/i,
      })[0]
    );

    expect(
      screen.getByRole("dialog")
    ).toBeInTheDocument();

expect(
  screen.getByRole("dialog")
).toHaveTextContent("Agua segura");
  });

  it("debe cerrar el recurso educativo", () => {
    render(<HomePage />);

    fireEvent.click(
      screen.getAllByRole("button", {
        name: /consultar recurso/i,
      })[0]
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Cerrar recurso" })
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("debe mostrar los enlaces de navegación principales", () => {
    render(<HomePage />);

    expect(
      screen.getAllByRole("link", { name: "Inicio" }).length
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByRole("link", { name: "Albergues" }).length
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByRole("link", { name: "Mapa" }).length
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByRole("link", { name: "Alertas" }).length
    ).toBeGreaterThan(0);
  });
});
