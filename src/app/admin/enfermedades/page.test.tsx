
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EnfermedadesPage from "./page";

describe("Página de enfermedades", () => {
  const renderPage = () => render(<EnfermedadesPage />);

  it("renderiza el encabezado, las estadísticas y los casos registrados", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Enfermedades y casos" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Casos registrados" })
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("Infección respiratoria aguda").length
    ).toBeGreaterThan(0);

    expect(screen.getAllByText("Gastroenteritis").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dermatitis").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Conjuntivitis").length).toBeGreaterThan(0);

    expect(
      screen.getByText("5 registros · 36 casos en total")
    ).toBeInTheDocument();
  });

  it("abre el formulario al presionar Registrar caso", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: /registrar caso/i })
    );

    expect(
      screen.getByRole("heading", { name: "Registrar caso" })
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Enfermedad *")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Número de personas afectadas *")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Fecha de detección *")).toBeInTheDocument();
    expect(screen.getByLabelText("Estado del caso *")).toBeInTheDocument();
    expect(screen.getByLabelText("Síntomas principales *")).toBeInTheDocument();
    expect(screen.getByLabelText("Observaciones")).toBeInTheDocument();
  });

  it("cierra el formulario con el botón Cancelar", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: /registrar caso/i })
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(
      screen.queryByRole("heading", { name: "Registrar caso" })
    ).not.toBeInTheDocument();
  });

  it("cierra el formulario con el botón de cerrar", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: /registrar caso/i })
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Cerrar formulario" })
    );

    expect(
      screen.queryByRole("heading", { name: "Registrar caso" })
    ).not.toBeInTheDocument();
  });

  it("muestra un error cuando la cantidad de personas es inválida", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: /registrar caso/i })
    );

    fireEvent.change(
      screen.getByLabelText("Número de personas afectadas *"),
      { target: { value: "0" } }
    );

    fireEvent.change(screen.getByLabelText("Síntomas principales *"), {
      target: { value: "Fiebre y tos" },
    });

    const form = screen
      .getByLabelText("Síntomas principales *")
      .closest("form");

    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Ingresa un número válido de personas afectadas."
    );
  });

  it("muestra un error cuando no se ingresan los síntomas principales", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: /registrar caso/i })
    );

    fireEvent.change(
      screen.getByLabelText("Síntomas principales *"),
      { target: { value: "   " } }
    );

    const form = screen
      .getByLabelText("Síntomas principales *")
      .closest("form");

    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Debes ingresar los síntomas principales."
    );
  });

  it("registra un nuevo caso y actualiza los totales y el listado", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: /registrar caso/i })
    );

    fireEvent.change(screen.getByLabelText("Enfermedad *"), {
      target: { value: "Gastroenteritis" },
    });

    fireEvent.change(
      screen.getByLabelText("Número de personas afectadas *"),
      { target: { value: "2" } }
    );

    fireEvent.change(screen.getByLabelText("Fecha de detección *"), {
      target: { value: "2026-10-06" },
    });

    fireEvent.change(screen.getByLabelText("Estado del caso *"), {
      target: { value: "Activo" },
    });

    fireEvent.change(screen.getByLabelText("Síntomas principales *"), {
      target: { value: "Diarrea y dolor abdominal" },
    });

    fireEvent.change(screen.getByLabelText("Observaciones"), {
      target: { value: "Se reforzaron las medidas de higiene." },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /guardar registro/i })
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "El caso se registró correctamente."
    );

    expect(
      screen.getByText("6 registros · 38 casos en total")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Diarrea y dolor abdominal")
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: "Registrar caso" })
    ).not.toBeInTheDocument();
  });

  it("filtra los casos por el nombre de la enfermedad", () => {
    renderPage();

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Buscar enfermedad" }),
      { target: { value: "Dermatitis" } }
    );

    const filas = screen.getAllByRole("row");

    expect(
      filas.some((fila) =>
        within(fila).queryByText("Dermatitis")
      )
    ).toBe(true);

    expect(
      filas.some((fila) =>
        within(fila).queryByText("Conjuntivitis")
      )
    ).toBe(false);

    expect(
      screen.getByText("Mostrando 1 de 5 registros")
    ).toBeInTheDocument();
  });

  it("filtra los casos por estado", () => {
    renderPage();

    fireEvent.change(
      screen.getByRole("combobox", { name: "Filtrar por estado" }),
      { target: { value: "Recuperado" } }
    );

    const filas = screen.getAllByRole("row");

    expect(
      filas.some((fila) =>
        within(fila).queryByText("Conjuntivitis")
      )
    ).toBe(true);

    expect(
      filas.some((fila) =>
        within(fila).queryByText("Dermatitis")
      )
    ).toBe(false);

    expect(
      screen.getByText("Mostrando 2 de 5 registros")
    ).toBeInTheDocument();
  });

  it("muestra un mensaje cuando no hay resultados de búsqueda", () => {
    renderPage();

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Buscar enfermedad" }),
      { target: { value: "Enfermedad inexistente" } }
    );

    expect(
      screen.getByText("No se encontraron casos registrados.")
    ).toBeInTheDocument();
  });

  it("abre el detalle de un caso y permite cerrarlo", () => {
    renderPage();

    const elementoDermatitis = screen
      .getAllByText("Dermatitis")
      .find((elemento) => elemento.closest("tr"));

    expect(elementoDermatitis).toBeDefined();

    const fila = elementoDermatitis!.closest("tr");

    expect(fila).not.toBeNull();

    fireEvent.click(
      within(fila!).getByRole("button", { name: "Ver" })
    );

    expect(
      screen.getByRole("heading", { name: "Detalle del caso" })
    ).toBeInTheDocument();

    expect(
  screen.getAllByText("Irritación y lesiones cutáneas.").length
).toBeGreaterThan(0);

    fireEvent.click(
      screen.getByRole("button", { name: "Cerrar detalle" })
    );

    expect(
      screen.queryByRole("heading", { name: "Detalle del caso" })
    ).not.toBeInTheDocument();
  });

  it("muestra las enfermedades más frecuentes", () => {
    renderPage();

    expect(
      screen.getByRole("heading", {
        name: "Enfermedades más frecuentes",
      })
    ).toBeInTheDocument();

    expect(screen.getByText("20 casos")).toBeInTheDocument();
  });
});
