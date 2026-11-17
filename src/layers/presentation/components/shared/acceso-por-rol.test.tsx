import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cerrarSesion, guardarToken } from "@/layers/application/services/sesion";
import { AccesoPorRol } from "./acceso-por-rol";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

function iniciar(rol: string, exp = Math.floor(Date.now() / 1000) + 3600) {
  const token = `header.${btoa(JSON.stringify({ role: rol, exp }))}.firma`;
  guardarToken(token);
}

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe("Acceso por rol (localStorage sin polling)", () => {
  it("oculta el contenido sin sesión y dirige al login", async () => {
    render(<AccesoPorRol rol="super_administrador">Privado</AccesoPorRol>);
    expect(screen.queryByText("Privado")).not.toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });

  it("dirige al administrador a /albergue si intenta entrar a /gestion", async () => {
    iniciar("administrador_albergue");
    render(<AccesoPorRol rol="super_administrador">Privado</AccesoPorRol>);
    expect(screen.queryByText("Privado")).not.toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/albergue"));
  });

  it("permite el rol correcto y reacciona inmediatamente al cerrar sesión sin setInterval", async () => {
    iniciar("super_administrador");
    render(<AccesoPorRol rol="super_administrador">Privado</AccesoPorRol>);
    expect(await screen.findByText("Privado")).toBeInTheDocument();

    act(() => {
      cerrarSesion();
    });

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText("Privado")).not.toBeInTheDocument();
  });
});
