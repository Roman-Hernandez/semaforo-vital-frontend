
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

describe("Menú lateral - Semáforo Vital", () => {
  it("muestra todas las opciones del menú", () => {
    vi.mocked(usePathname).mockReturnValue("/admin");

    render(<Sidebar isOpen={false} onClose={vi.fn()} />);

    expect(screen.getAllByText("Inicio").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mi albergue").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Población").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Condiciones sanitarias").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Enfermedades").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Semáforo Vital").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Alertas").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Predicciones").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Modelo SIR").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Análisis IA").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Intervenciones").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Historial").length).toBeGreaterThan(0);
  });

  it("muestra el contador de alertas", () => {
    vi.mocked(usePathname).mockReturnValue("/admin/alertas");

    render(<Sidebar isOpen={false} onClose={vi.fn()} />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("marca la opción correspondiente a la página activa", () => {
    vi.mocked(usePathname).mockReturnValue("/admin/historial");

    render(<Sidebar isOpen={false} onClose={vi.fn()} />);

    const enlace = screen.getByRole("link", { name: /historial/i });

    expect(enlace).toHaveAttribute("aria-current", "page");
  });

  it("no marca Inicio como activo en otras páginas", () => {
    vi.mocked(usePathname).mockReturnValue("/admin/historial");

    render(<Sidebar isOpen={false} onClose={vi.fn()} />);

    const inicio = screen.getByRole("link", { name: /inicio/i });

    expect(inicio).not.toHaveAttribute("aria-current", "page");
  });

  it("muestra el menú móvil cuando está abierto", () => {
    vi.mocked(usePathname).mockReturnValue("/admin");

    const { container } = render(
      <Sidebar isOpen={true} onClose={vi.fn()} />
    );

    expect(container.querySelector(".fixed.inset-0.z-50")).toBeInTheDocument();
  });

  it("no muestra el menú móvil cuando está cerrado", () => {
    vi.mocked(usePathname).mockReturnValue("/admin");

    const { container } = render(
      <Sidebar isOpen={false} onClose={vi.fn()} />
    );

    expect(container.querySelector(".fixed.inset-0.z-50")).not.toBeInTheDocument();
  });

  it("cierra el menú al seleccionar una opción", () => {
    vi.mocked(usePathname).mockReturnValue("/admin");

    const onClose = vi.fn();

    render(<Sidebar isOpen={true} onClose={onClose} />);

    const enlaces = screen.getAllByRole("link", { name: /historial/i });

    fireEvent.click(enlaces[enlaces.length - 1]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

it("cierra el menú al presionar el botón X", () => {
  vi.mocked(usePathname).mockReturnValue("/admin");

  const onClose = vi.fn();

  render(<Sidebar isOpen={true} onClose={onClose} />);

  const botonesCerrar = screen.getAllByRole("button", {
    name: /cerrar menú/i,
  });

  fireEvent.click(botonesCerrar[1]);

  expect(onClose).toHaveBeenCalledTimes(1);
});
});