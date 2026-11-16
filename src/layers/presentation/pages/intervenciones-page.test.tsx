import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../application/services/api-client";
import {
  INTERVENCIONES_DEMO,
  crearGatewayMemoria,
  type IntervencionesGateway,
} from "../../application/services/intervenciones-service";
import { IntervencionesPage } from "./intervenciones-page";

const HOY = "2026-11-15";

function renderizar(gateway: IntervencionesGateway = crearGatewayMemoria(INTERVENCIONES_DEMO, 0), modoDemostracion = false) {
  const usuario = userEvent.setup();
  render(<IntervencionesPage gateway={gateway} hoy={HOY} modoDemostracion={modoDemostracion} />);
  return usuario;
}

function formulario() {
  return within(screen.getByRole("complementary", { name: "Nueva intervención" }));
}

async function llenarFormulario(usuario: ReturnType<typeof userEvent.setup>) {
  const form = formulario();
  await usuario.selectOptions(form.getByLabelText(/Tipo de intervención/), "Ventilación");
  await usuario.type(form.getByLabelText(/Descripción/), "Apertura de ventanas en los dormitorios.");
  await usuario.type(form.getByLabelText(/Fecha de realización/), "2026-11-14");
}

describe("Intervenciones sanitarias - Administrador de albergue", () => {
  it("muestra la carga y luego el historial con tipo, descripción y fecha", async () => {
    renderizar();

    expect(screen.getByText("Cargando intervenciones…")).toBeInTheDocument();

    const tabla = within(await screen.findByRole("table"));
    expect(screen.getByRole("heading", { name: "Gestión de intervenciones" })).toBeInTheDocument();
    expect(tabla.getByText("12 nov 2026")).toBeInTheDocument();
    expect(tabla.getByText("Agua potable")).toBeInTheDocument();
    expect(tabla.getByText(/Instalación de dos tanques/)).toBeInTheDocument();
    expect(tabla.getByText("Se programó revisión del cloro residual cada 48 horas.")).toBeInTheDocument();
    expect(screen.getByText("Mostrando 4 de 4 intervenciones")).toBeInTheDocument();
  });

  it("muestra el resumen del albergue", async () => {
    renderizar();
    await screen.findByRole("table");

    const resumen = within(screen.getByRole("region", { name: "Resumen de intervenciones" }));
    expect(resumen.getAllByText("4")).toHaveLength(2);
    expect(resumen.getByText("2")).toBeInTheDocument();
    expect(resumen.getByText("1 registro")).toBeInTheDocument();
  });

  it("muestra el estado vacío cuando no hay registros", async () => {
    renderizar(crearGatewayMemoria([], 0));

    expect(await screen.findByText("Aún no hay intervenciones registradas")).toBeInTheDocument();
    expect(screen.getByText("Sin registros")).toBeInTheDocument();
  });

  it("filtra por texto, tipo y fecha, y permite limpiar los filtros", async () => {
    const usuario = renderizar();
    await screen.findByRole("table");

    await usuario.type(screen.getByRole("searchbox"), "jabon");
    expect(within(screen.getByRole("table")).getByText("Higiene")).toBeInTheDocument();
    expect(screen.getByText("Mostrando 1 de 4 intervenciones")).toBeInTheDocument();

    await usuario.clear(screen.getByRole("searchbox"));
    await usuario.selectOptions(screen.getByLabelText("Tipo"), "Saneamiento");
    expect(screen.getByText("Mostrando 1 de 4 intervenciones")).toBeInTheDocument();

    await usuario.selectOptions(screen.getByLabelText("Tipo"), "");
    await usuario.type(screen.getByLabelText("Desde la fecha"), "2026-11-09");
    expect(screen.getByText("Mostrando 2 de 4 intervenciones")).toBeInTheDocument();

    await usuario.type(screen.getByRole("searchbox"), "no existe");
    expect(screen.getByText("No hay intervenciones con los filtros aplicados")).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(screen.getByText("Mostrando 4 de 4 intervenciones")).toBeInTheDocument();
  });

  it("valida los campos obligatorios", async () => {
    const usuario = renderizar();
    await screen.findByRole("table");

    await usuario.click(formulario().getByRole("button", { name: "Guardar intervención" }));

    const form = formulario();
    expect(form.getByText("Revisa los campos marcados antes de guardar.")).toBeInTheDocument();
    expect(form.getByText("Selecciona el tipo de intervención.")).toBeInTheDocument();
    expect(form.getByText("La descripción es obligatoria.")).toBeInTheDocument();
    expect(form.getByText("La fecha de realización es obligatoria.")).toBeInTheDocument();
    expect(form.getByLabelText(/Tipo de intervención/)).toHaveFocus();
    expect(form.getByLabelText(/Tipo de intervención/)).toHaveAttribute("aria-invalid", "true");

    await usuario.selectOptions(form.getByLabelText(/Tipo de intervención/), "Higiene");
    expect(form.queryByText("Selecciona el tipo de intervención.")).not.toBeInTheDocument();
  });

  it("registra una intervención, muestra el éxito y la agrega al historial", async () => {
    const usuario = renderizar();
    await screen.findByRole("table");

    await llenarFormulario(usuario);
    await usuario.click(formulario().getByRole("button", { name: "Guardar intervención" }));

    expect(await screen.findByText("La intervención de tipo “Ventilación” se registró correctamente.")).toBeInTheDocument();
    expect(within(screen.getByRole("table")).getByText("Apertura de ventanas en los dormitorios.")).toBeInTheDocument();
    expect(screen.getByText("Mostrando 5 de 5 intervenciones")).toBeInTheDocument();
    expect(formulario().getByLabelText(/Descripción/)).toHaveValue("");

    await usuario.click(screen.getByRole("button", { name: "Cerrar aviso" }));
    expect(screen.queryByText(/se registró correctamente/)).not.toBeInTheDocument();
  });

  it("muestra el estado de guardado y los errores del servidor", async () => {
    let rechazar: (error: unknown) => void = () => {};
    const gateway = crearGatewayMemoria(INTERVENCIONES_DEMO, 0);
    vi.spyOn(gateway, "registrar").mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rechazar = reject;
        })
    );
    const usuario = renderizar(gateway);
    await screen.findByRole("table");

    await llenarFormulario(usuario);
    await usuario.click(formulario().getByRole("button", { name: "Guardar intervención" }));

    expect(formulario().getByRole("button", { name: "Guardando…" })).toBeDisabled();

    rechazar(new ApiError(422, "Revisa los datos ingresados.", { descripcion: "Texto no permitido" }));

    expect(await formulario().findByText("Revisa los datos ingresados.")).toBeInTheDocument();
    expect(formulario().getByText("Texto no permitido")).toBeInTheDocument();
  });

  it("muestra un mensaje genérico ante errores inesperados al guardar", async () => {
    const gateway = crearGatewayMemoria(INTERVENCIONES_DEMO, 0);
    vi.spyOn(gateway, "registrar").mockRejectedValue(new TypeError("x"));
    const usuario = renderizar(gateway);
    await screen.findByRole("table");

    await llenarFormulario(usuario);
    await usuario.click(formulario().getByRole("button", { name: "Guardar intervención" }));

    expect(
      await formulario().findByText("No fue posible registrar la intervención. Inténtalo nuevamente.")
    ).toBeInTheDocument();
  });

  it("permite cancelar el formulario", async () => {
    const usuario = renderizar();
    await screen.findByRole("table");

    await usuario.type(formulario().getByLabelText(/Descripción/), "Texto temporal");
    await usuario.click(formulario().getByRole("button", { name: "Cancelar" }));

    expect(formulario().getByLabelText(/Descripción/)).toHaveValue("");
  });

  it("muestra el error de carga y permite reintentar", async () => {
    const gateway = crearGatewayMemoria(INTERVENCIONES_DEMO, 0);
    const listar = vi
      .spyOn(gateway, "listar")
      .mockRejectedValueOnce(new ApiError(500, "Ocurrió un error en el servidor. Inténtalo nuevamente."))
      .mockRejectedValueOnce(new TypeError("red"));
    const usuario = renderizar(gateway);

    expect(await screen.findByText("No fue posible cargar las intervenciones")).toBeInTheDocument();
    expect(screen.getByText("Ocurrió un error en el servidor. Inténtalo nuevamente.")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText("Verifica tu conexión e inténtalo nuevamente.")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(listar).toHaveBeenCalledTimes(3);
  });

  it("muestra tarjetas en celulares y el aviso de datos demostrativos", async () => {
    const usuario = renderizar(undefined, true);

    expect(screen.getByText(/Datos demostrativos/)).toBeInTheDocument();
    const lista = within(await screen.findByRole("list", { name: "Intervenciones registradas" }));
    expect(lista.getAllByRole("listitem")).toHaveLength(4);

    Element.prototype.scrollIntoView = vi.fn();
    await usuario.click(screen.getByRole("button", { name: "Registrar intervención" }));
    expect(formulario().getByLabelText(/Tipo de intervención/)).toHaveFocus();
  });
});
