
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MiAlberguePage from "./page";

describe("MiAlberguePage", () => {
  it("debe renderizar el título y la descripción de la página", () => {
    render(<MiAlberguePage />);

    expect(
      screen.getByRole("heading", { name: "Mi Albergue" })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Consulta y actualización de la información del albergue"
      )
    ).toBeInTheDocument();
  });

  it("debe mostrar la información inicial del albergue", () => {
    render(<MiAlberguePage />);

    expect(screen.getByText("San José")).toBeInTheDocument();
    expect(
      screen.getByText("Carrera 8 # 24-35, Centro, Pereira")
    ).toBeInTheDocument();
    expect(screen.getByText("180 personas")).toBeInTheDocument();
    expect(screen.getByText("Laura Martínez")).toBeInTheDocument();
    expect(screen.getByText("+57 310 555 0142")).toBeInTheDocument();
    expect(
      screen.getByText("sanjose@albergues.org.co")
    ).toBeInTheDocument();
  });

  it("debe mostrar el estado activo y la fecha de registro", () => {
    render(<MiAlberguePage />);

    expect(screen.getByText("Activo")).toBeInTheDocument();
    expect(
      screen.getByText("12 de septiembre de 2026")
    ).toBeInTheDocument();
  });

  it("debe permitir activar el modo de edición", () => {
    render(<MiAlberguePage />);

    fireEvent.click(
      screen.getByRole("button", { name: /editar información/i })
    );

    expect(
      screen.getByRole("button", { name: /guardar cambios/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /cancelar/i })
    ).toBeInTheDocument();

    expect(screen.getByDisplayValue("San José")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Carrera 8 # 24-35, Centro, Pereira")
    ).toBeInTheDocument();
  });

  it("debe permitir modificar y guardar la información", () => {
    render(<MiAlberguePage />);

    fireEvent.click(
      screen.getByRole("button", { name: /editar información/i })
    );

    fireEvent.change(screen.getByDisplayValue("San José"), {
      target: { value: "Nuevo Albergue" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /guardar cambios/i })
    );

    expect(screen.getByText("Nuevo Albergue")).toBeInTheDocument();

    expect(screen.getByRole("status")).toHaveTextContent(
      "La información del albergue se actualizó correctamente."
    );
  });

  it("debe restaurar los datos originales al cancelar la edición", () => {
    render(<MiAlberguePage />);

    fireEvent.click(
      screen.getByRole("button", { name: /editar información/i })
    );

    fireEvent.change(screen.getByDisplayValue("San José"), {
      target: { value: "Nombre modificado" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /cancelar/i })
    );

    expect(screen.getByText("San José")).toBeInTheDocument();
    expect(screen.queryByText("Nombre modificado")).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /editar información/i })
    ).toBeInTheDocument();
  });

  it("debe mostrar un error cuando hay campos obligatorios vacíos", () => {
    render(<MiAlberguePage />);

    fireEvent.click(
      screen.getByRole("button", { name: /editar información/i })
    );

    fireEvent.change(screen.getByDisplayValue("San José"), {
      target: { value: "" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /guardar cambios/i })
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Todos los campos son obligatorios."
    );
  });

  it("debe validar que la capacidad sea un número entero mayor que cero", () => {
    render(<MiAlberguePage />);

    fireEvent.click(
      screen.getByRole("button", { name: /editar información/i })
    );

    fireEvent.change(screen.getByDisplayValue("180"), {
      target: { value: "0" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /guardar cambios/i })
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "La capacidad debe ser un número entero mayor que cero."
    );
  });

  it("debe validar el formato del correo electrónico", () => {
    render(<MiAlberguePage />);

    fireEvent.click(
      screen.getByRole("button", { name: /editar información/i })
    );

    fireEvent.change(
      screen.getByDisplayValue("sanjose@albergues.org.co"),
      {
        target: { value: "correo-invalido" },
      }
    );

    fireEvent.click(
      screen.getByRole("button", { name: /guardar cambios/i })
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Ingresa un correo electrónico válido."
    );
  });

  it("debe validar el formato del teléfono", () => {
    render(<MiAlberguePage />);

    fireEvent.click(
      screen.getByRole("button", { name: /editar información/i })
    );

    fireEvent.change(
      screen.getByDisplayValue("+57 310 555 0142"),
      {
        target: { value: "abc" },
      }
    );

    fireEvent.click(
      screen.getByRole("button", { name: /guardar cambios/i })
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Ingresa un número de teléfono válido."
    );
  });
});
