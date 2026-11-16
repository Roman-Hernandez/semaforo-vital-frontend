import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../application/services/api-client";
import {
  RESULTADOS_DEMO,
  crearGatewayMemoria,
  type AnalisisRegresionGateway,
} from "../../application/services/analisis-regresion-service";
import { AnalisisRegresionPage } from "./analisis-regresion-page";

function renderizar(gateway: AnalisisRegresionGateway = crearGatewayMemoria(RESULTADOS_DEMO, 0), modoDemostracion = false) {
  const usuario = userEvent.setup();
  render(<AnalisisRegresionPage gateway={gateway} modoDemostracion={modoDemostracion} />);
  return usuario;
}

describe("Resultados de regresión logística - Administrador de albergue", () => {
  it("muestra la carga y luego los resultados de la ejecución más reciente", async () => {
    renderizar();

    expect(screen.getByText("Cargando resultados del análisis…")).toBeInTheDocument();

    const tabla = within(await screen.findByRole("table"));
    expect(screen.getByRole("heading", { name: "Análisis de regresión logística" })).toBeInTheDocument();

    const filas = tabla.getAllByRole("row");
    expect(filas).toHaveLength(7);
    expect(within(filas[1]).getByText("REG-0142")).toBeInTheDocument();
    expect(within(filas[1]).getByText("Contagiado")).toBeInTheDocument();
    expect(within(filas[1]).getByText("87%")).toBeInTheDocument();
    expect(within(filas[1]).getByText(/14 nov 2026/)).toBeInTheDocument();
    expect(within(filas[1]).getByText("Regresión logística binaria · v1.2.0")).toBeInTheDocument();
    expect(within(filas[6]).getByText("No contagiado")).toBeInTheDocument();
    expect(screen.getByText("Mostrando 6 de 6 registros de esta ejecución")).toBeInTheDocument();
  });

  it("aclara que el resultado es una estimación y no un diagnóstico médico", async () => {
    renderizar();
    await screen.findByRole("table");

    const aviso = within(screen.getByRole("complementary", { name: "Aviso sobre los resultados" }));
    expect(aviso.getByText("Estos resultados son estimaciones estadísticas, no un diagnóstico médico")).toBeInTheDocument();
  });

  it("resume la ejecución con fecha, versión del modelo y totales", async () => {
    renderizar();
    await screen.findByRole("table");

    const resumen = within(screen.getByRole("region", { name: "Resumen del análisis" }));
    expect(resumen.getByText("v1.2.0")).toBeInTheDocument();
    expect(resumen.getByText("6")).toBeInTheDocument();
    expect(resumen.getByText("3")).toBeInTheDocument();
    expect(resumen.getByText("50% de los registros")).toBeInTheDocument();
  });

  it("permite consultar una ejecución anterior sin versión de modelo", async () => {
    const usuario = renderizar();
    await screen.findByRole("table");

    const selector = screen.getByLabelText("Ejecución del análisis");
    expect(within(selector).getAllByRole("option")).toHaveLength(2);

    await usuario.selectOptions(selector, within(selector).getAllByRole("option")[1]);

    expect(screen.getByText("Mostrando 3 de 3 registros de esta ejecución")).toBeInTheDocument();
    expect(within(screen.getByRole("table")).getAllByText("Versión no disponible")).toHaveLength(3);
    expect(within(screen.getByRole("region", { name: "Resumen del análisis" })).getByText("No disponible")).toBeInTheDocument();
  });

  it("filtra por clasificación e informa si no hay coincidencias", async () => {
    const usuario = renderizar(
      crearGatewayMemoria(RESULTADOS_DEMO.filter((r) => r.clasificacion === "no_contagiado"), 0)
    );
    await screen.findByRole("table");

    await usuario.selectOptions(screen.getByLabelText("Clasificación"), "no_contagiado");
    expect(within(screen.getByRole("table")).queryByText("Contagiado")).not.toBeInTheDocument();

    await usuario.selectOptions(screen.getByLabelText("Clasificación"), "contagiado");
    expect(screen.getByText("No hay resultados con esta clasificación")).toBeInTheDocument();
  });

  it("informa cuando no existen resultados", async () => {
    renderizar(crearGatewayMemoria([], 0));

    expect(await screen.findByText("Aún no hay resultados del análisis")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Resumen del análisis" })).not.toBeInTheDocument();
  });

  it("muestra el error y permite reintentar", async () => {
    const gateway = crearGatewayMemoria(RESULTADOS_DEMO, 0);
    const listar = vi
      .spyOn(gateway, "listarResultados")
      .mockRejectedValueOnce(new ApiError(403, "No tienes permisos para realizar esta acción."))
      .mockRejectedValueOnce(new TypeError("red"));
    const usuario = renderizar(gateway);

    expect(await screen.findByText("No fue posible cargar los resultados")).toBeInTheDocument();
    expect(screen.getByText("No tienes permisos para realizar esta acción.")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText("Verifica tu conexión e inténtalo nuevamente.")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(listar).toHaveBeenCalledTimes(3);
  });

  it("muestra tarjetas en celulares y el aviso de datos demostrativos", async () => {
    renderizar(undefined, true);

    expect(screen.getByText(/Datos demostrativos/)).toBeInTheDocument();
    const lista = within(await screen.findByRole("list", { name: "Resultados del análisis" }));
    expect(lista.getAllByRole("listitem")).toHaveLength(6);
  });
});
