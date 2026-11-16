import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePathname } from "next/navigation";
import SuperAdminSidebar, { superAdminMenu } from "./SuperAdminSidebar";
import SuperAdminShell from "./SuperAdminShell";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

describe("Menú lateral del Súper Administrador", () => {
  it("muestra todas las opciones de navegación global", () => {
    vi.mocked(usePathname).mockReturnValue("/super-admin/albergues");

    render(<SuperAdminSidebar isOpen={false} onClose={vi.fn()} />);

    for (const item of superAdminMenu) {
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute("href", item.href);
    }
  });

  it("marca Albergues como página activa", () => {
    vi.mocked(usePathname).mockReturnValue("/super-admin/albergues");

    render(<SuperAdminSidebar isOpen={false} onClose={vi.fn()} />);

    expect(screen.getByRole("link", { name: "Albergues" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });

  it("abre y cierra el menú en tabletas y celulares", () => {
    vi.mocked(usePathname).mockReturnValue("/super-admin/albergues");

    render(
      <SuperAdminShell>
        <p>Contenido</p>
      </SuperAdminShell>
    );

    fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }));
    expect(screen.getAllByRole("navigation", { name: "Menú del súper administrador" })).toHaveLength(2);

    fireEvent.click(screen.getAllByRole("button", { name: "Cerrar menú" })[0]);
    expect(screen.getAllByRole("navigation", { name: "Menú del súper administrador" })).toHaveLength(1);
  });
});
