
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "next/navigation";
import LoginPage from "./page";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("Inicio de sesión - Semáforo Vital", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue({
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);
  });

  it("muestra los campos y el botón de inicio de sesión", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("textbox", { name: "Correo electrónico" })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Contraseña", { exact: true })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /iniciar sesión/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /continuar como usuario público/i,
      })
    ).toBeInTheDocument();
  });

  it("configura los campos como obligatorios", () => {
    render(<LoginPage />);

    const correo = screen.getByRole("textbox", {
      name: "Correo electrónico",
    });

    const contrasena = screen.getByLabelText("Contraseña", {
      exact: true,
    });

    expect(correo).toBeRequired();
    expect(correo).toHaveAttribute("type", "email");
    expect(contrasena).toBeRequired();
  });

  it("permite mostrar y ocultar la contraseña", () => {
    render(<LoginPage />);

    const contrasena = screen.getByLabelText("Contraseña", {
      exact: true,
    });

    expect(contrasena).toHaveAttribute("type", "password");

    fireEvent.click(
      screen.getByRole("button", {
        name: /mostrar contraseña/i,
      })
    );

    expect(contrasena).toHaveAttribute("type", "text");

    fireEvent.click(
      screen.getByRole("button", {
        name: /ocultar contraseña/i,
      })
    );

    expect(contrasena).toHaveAttribute("type", "password");
  });

 it("muestra el estado de carga y después un error genérico", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({
        detail: "No fue posible iniciar sesión",
      }),
    })
  );

  render(<LoginPage />);

  // Aquí conservas el resto de tu prueba actual.

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Correo electrónico",
      }),
      {
        target: { value: "prueba@ejemplo.com" },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Contraseña", {
        exact: true,
      }),
      {
        target: { value: "ClavePrueba123" },
      }
    );

    const formulario = screen.getByRole("button", {
      name: /iniciar sesión/i,
    }).closest("form");

    expect(formulario).not.toBeNull();

    fireEvent.submit(formulario!);

    const botonEnviar = formulario!.querySelector(
      'button[type="submit"]'
    );

    expect(botonEnviar).toBeDisabled();

    expect(
      await screen.findByText(/no fue posible iniciar sesión/i, {}, {
        timeout: 5000,
      })
    ).toBeInTheDocument();
  });
});
