import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "next/navigation";
import LoginPage from "./page";
import { CLAVE_TOKEN, CLAVE_USUARIO } from "@/layers/application/services/sesion";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("Inicio de sesión institucional - Semáforo Vital", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();

    vi.mocked(useRouter).mockReturnValue({
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);
  });

  it("muestra los campos obligatorios y no incluye botones falsos de recuperar contraseña", () => {
    render(<LoginPage />);

    const correo = screen.getByRole("textbox", { name: "Correo electrónico" });
    const contrasena = screen.getByLabelText("Contraseña", { exact: true });

    expect(correo).toBeRequired();
    expect(correo).toHaveAttribute("type", "email");
    expect(contrasena).toBeRequired();
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.queryByText(/olvidaste tu contraseña/i)).not.toBeInTheDocument();
  });

  it("permite mostrar y ocultar la contraseña", () => {
    render(<LoginPage />);

    const contrasena = screen.getByLabelText("Contraseña", { exact: true });
    expect(contrasena).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: /mostrar contraseña/i }));
    expect(contrasena).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: /ocultar contraseña/i }));
    expect(contrasena).toHaveAttribute("type", "password");
  });

  it("muestra el estado de error devuelto por el servidor", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({
          detail: "Credenciales inválidas",
        }),
      })
    );

    render(<LoginPage />);

    fireEvent.change(screen.getByRole("textbox", { name: "Correo electrónico" }), {
      target: { value: "prueba@ejemplo.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña", { exact: true }), {
      target: { value: "ClavePrueba123" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /iniciar sesión/i }).closest("form")!);

    expect(await screen.findByText(/credenciales inválidas/i)).toBeInTheDocument();
  });

  it.each([
    ["super_administrador", "/gestion/albergues"],
    ["administrador_albergue", "/albergue"],
  ])("guarda el token y perfil en localStorage y redirige a %s", async (role, ruta) => {
    const token = `header.${btoa(JSON.stringify({ role, exp: Math.floor(Date.now() / 1000) + 3600 }))}.firma`;
    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).endsWith("/api/v1/auth/login")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ access_token: token, token_type: "bearer" }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          id: "u-1",
          email: "admin@example.com",
          role,
          active: true,
          nombre: "Carlos",
          apellido: "Ruiz",
          albergue_id: "alb-1",
        }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<LoginPage />);
    fireEvent.change(screen.getByRole("textbox", { name: "Correo electrónico" }), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña", { exact: true }), {
      target: { value: "password123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /iniciar sesión/i }).closest("form")!);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(ruta));
    expect(localStorage.getItem(CLAVE_TOKEN)).toBe(token);
    expect(JSON.parse(localStorage.getItem(CLAVE_USUARIO) ?? "{}")).toMatchObject({
      email: "admin@example.com",
      role,
    });
  });
});
