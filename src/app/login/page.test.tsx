
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoginPage from "./page";

describe("Inicio de sesión - Semáforo Vital", () => {
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
    render(<LoginPage />);

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
