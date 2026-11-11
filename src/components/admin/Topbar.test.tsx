
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePathname, useRouter } from "next/navigation";
import Topbar from "./Topbar";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

describe("Barra superior - Semáforo Vital", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(usePathname).mockReturnValue("/admin/historial");

    vi.mocked(useRouter).mockReturnValue({
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      push: vi.fn(),
      replace: mockReplace,
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);
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

  it("muestra el botón para cerrar sesión", () => {
    render(<Topbar onMenuClick={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: /cerrar sesión/i })
    ).toBeInTheDocument();
  });

  it("abre la ventana de confirmación al presionar cerrar sesión", () => {
    render(<Topbar onMenuClick={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: /cerrar sesión/i })
    );

    expect(
      screen.getByRole("dialog")
    ).toBeInTheDocument();

    expect(
      screen.getByText("¿Cerrar sesión?")
    ).toBeInTheDocument();
  });

  it("cierra la ventana al presionar cancelar", () => {
    render(<Topbar onMenuClick={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: /cerrar sesión/i })
    );

    fireEvent.click(
      screen.getByRole("button", { name: /cancelar/i })
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("elimina el token y redirige al login al confirmar", () => {
    sessionStorage.setItem("access_token", "token-prueba");

    render(<Topbar onMenuClick={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: /cerrar sesión/i })
    );

    fireEvent.click(
      screen.getByRole("button", { name: /sí, cerrar sesión/i })
    );

    expect(sessionStorage.getItem("access_token")).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith("/login");
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
