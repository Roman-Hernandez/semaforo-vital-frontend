
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import CondicionesSanitariasPage from "./page";

describe("Página de condiciones sanitarias", () => {
  it("renderiza el encabezado y las tarjetas del estado actual", () => {
    render(<CondicionesSanitariasPage />);

    expect(
      screen.getByRole("heading", { name: "Condiciones sanitarias" })
    ).toBeInTheDocument();
    expect(screen.getAllByText("Agua potable").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Baños y letrinas").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Higiene").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Saneamiento").length).toBeGreaterThan(0);
  });

  it("muestra el formulario al presionar Registrar condiciones", () => {
    render(<CondicionesSanitariasPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /registrar condiciones/i })
    );

    expect(
      screen.getByRole("heading", { name: "Registrar condiciones" })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/disponibilidad de agua potable/i))
      .toBeInTheDocument();

    expect(screen.getByLabelText(/cantidad de baños/i))
      .toBeInTheDocument();

    expect(screen.getByLabelText(/cantidad de letrinas/i))
      .toBeInTheDocument();
  });

  it("permite cancelar el formulario", () => {
    render(<CondicionesSanitariasPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /registrar condiciones/i })
    );

    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(
      screen.queryByRole("heading", { name: "Registrar condiciones" })
    ).not.toBeInTheDocument();
  });

  it("muestra un error cuando las cantidades son negativas", () => {
    render(<CondicionesSanitariasPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /registrar condiciones/i })
    );

    fireEvent.change(screen.getByLabelText(/cantidad de baños/i), {
      target: { value: "-1" },
    });

    const form = screen.getByLabelText(/cantidad de baños/i)
      .closest("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    expect(
    screen.getByText(
        "Las cantidades deben ser números enteros iguales o mayores que cero."
    )
    ).toBeInTheDocument();
  });

  it("guarda un nuevo registro y actualiza el historial", () => {
    render(<CondicionesSanitariasPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /registrar condiciones/i })
    );

    fireEvent.change(screen.getByLabelText(/observaciones/i), {
      target: { value: "Revisión sanitaria realizada correctamente." },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /guardar registro/i })
    );

    expect(
      screen.getByRole("status")
    ).toHaveTextContent(
      "El registro de condiciones sanitarias se guardó correctamente."
    );

   expect(
    screen.getByText(/2 registros de ejemplo/)
    ).toBeInTheDocument();

   expect(
    screen.getAllByText("Revisión sanitaria realizada correctamente.").length
    ).toBeGreaterThan(0);
  });

  it("permite actualizar un registro del historial", () => {
    render(<CondicionesSanitariasPage />);

    const editButton = screen.getByRole("button", {
      name: "Editar registro de Agua potable",
    });

    fireEvent.click(editButton);

    expect(
      screen.getByRole("heading", { name: "Actualizar condiciones" })
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/observaciones/i), {
      target: { value: "Se actualizó la revisión del agua." },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /guardar cambios/i })
    );

    expect(
      screen.getByRole("status")
    ).toHaveTextContent(
      "Las condiciones sanitarias se actualizaron correctamente."
    );
  });

  it("muestra la alerta cuando existe una condición crítica", () => {
    render(<CondicionesSanitariasPage />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Saneamiento crítico: requiere atención inmediata"
    );
  });

  it("muestra las cuatro condiciones en el historial", () => {
    render(<CondicionesSanitariasPage />);

    const table = screen.getByRole("table");

    expect(within(table).getByText("Agua potable")).toBeInTheDocument();
    expect(within(table).getByText("Baños y letrinas")).toBeInTheDocument();
    expect(within(table).getByText("Higiene")).toBeInTheDocument();
    expect(within(table).getByText("Saneamiento")).toBeInTheDocument();
  });
});
