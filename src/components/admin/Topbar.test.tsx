
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePathname } from "next/navigation";
import Topbar from "./Topbar";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

describe("Barra superior - Semáforo Vital", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue("/admin/historial");
  });

  it("muestra el título de la página", () => {
    render(<Topbar onMenuClick={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "Historial" })
    ).toBeInTheDocument();
  });

  it("muestra el nombre del albergue", () => {
    render(<Topbar onMenuClick={vi.fn()} />);

    expect(screen.getByText("Albergue San José")).toBeInTheDocument();
  });

  it("muestra la información del administrador", () => {
    render(<Topbar onMenuClick={vi.fn()} />);

    expect(screen.getByText("Laura Gómez")).toBeInTheDocument();

    expect(
      screen.getByText("Administrador de Albergue")
    ).toBeInTheDocument();
  });

  it("muestra el enlace para cerrar sesión", () => {
    render(<Topbar onMenuClick={vi.fn()} />);

    expect(
      screen.getByRole("link", { name: /cerrar sesión/i })
    ).toHaveAttribute("href", "/login");
  });

  it("ejecuta la función al presionar el botón hamburguesa", () => {
    const onMenuClick = vi.fn();

    render(<Topbar onMenuClick={onMenuClick} />);

    fireEvent.click(
      screen.getByRole("button", { name: /abrir menú/i })
    );

    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });
});
