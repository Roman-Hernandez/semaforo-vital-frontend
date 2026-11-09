import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Albergue } from "@/layers/domain/albergues/albergue";
import {
  ALBERGUES_DEMO,
  AlberguesError,
  crearGatewayMemoria,
  type AlberguesGateway,
} from "@/layers/application/services/albergues-service";
import type { Sesion } from "@/layers/application/services/sesion";
import { GestionAlberguesPage } from "./gestion-albergues-page";

const superAdmin: Sesion = { rol: "super_administrador", demostracion: false };

function renderizar(
  gateway: AlberguesGateway = crearGatewayMemoria(ALBERGUES_DEMO, 0),
  sesion: Sesion = superAdmin
) {
  const usuario = userEvent.setup();
  render(<GestionAlberguesPage gateway={gateway} sesion={sesion} />);
  return { usuario, gateway };
}

async function tablaCargada() {
  return within(await screen.findByRole("table"));
}

function panel() {
  return within(screen.getByRole("complementary", { name: "Detalle y formulario del albergue" }));
}

describe("Gestión de albergues - Súper Administrador", () => {
  it("muestra el estado de carga y luego el listado con sus datos principales", async () => {
    renderizar();

    expect(screen.getByText("Cargando albergues…")).toBeInTheDocument();

    const tabla = await tablaCargada();

    expect(screen.getByRole("heading", { name: "Gestión de albergues" })).toBeInTheDocument();
    expect(tabla.getByText("Albergue San José")).toBeInTheDocument();
    expect(tabla.getByText("ALB-PER-001")).toBeInTheDocument();
    expect(tabla.getByText("82% ocupación")).toBeInTheDocument();
    expect(tabla.getByText("María López")).toBeInTheDocument();
    expect(screen.getByText("7 centros · 6 activos")).toBeInTheDocument();
    expect(screen.getByText("Mostrando 1–5 de 7 albergues")).toBeInTheDocument();
  });

  it("permite identificar albergues activos e inactivos y filtrar por estado", async () => {
    const { usuario } = renderizar();
    const tabla = await tablaCargada();

    const filaInactiva = tabla.getByText("Complejo Municipal El Roble").closest("tr")!;
    expect(within(filaInactiva).getByText("Inactivo")).toBeInTheDocument();
    expect(within(tabla.getByText("Albergue San José").closest("tr")!).getByText("Activo")).toBeInTheDocument();

    await usuario.selectOptions(screen.getByLabelText("Filtrar por estado"), "inactivos");

    const filtrada = within(screen.getByRole("table"));
    expect(filtrada.getByText("Complejo Municipal El Roble")).toBeInTheDocument();
    expect(filtrada.queryByText("Albergue San José")).not.toBeInTheDocument();
  });

  it("busca sin importar tildes y filtra por riesgo", async () => {
    const { usuario } = renderizar();
    await tablaCargada();

    await usuario.type(screen.getByRole("searchbox"), "tecnico");
    expect(within(screen.getByRole("table")).getByText("Instituto Técnico Sur")).toBeInTheDocument();
    expect(within(screen.getByRole("table")).queryByText("Polideportivo Norte")).not.toBeInTheDocument();

    await usuario.clear(screen.getByRole("searchbox"));
    await usuario.selectOptions(screen.getByLabelText("Filtrar por riesgo"), "medio");
    expect(within(screen.getByRole("table")).getByText("Polideportivo Norte")).toBeInTheDocument();
    expect(within(screen.getByRole("table")).queryByText("Albergue San José")).not.toBeInTheDocument();
  });

  it("muestra un resultado vacío y permite limpiar los filtros", async () => {
    const { usuario } = renderizar();
    await tablaCargada();

    await usuario.type(screen.getByRole("searchbox"), "no existe ninguno");

    expect(screen.getByText("No se encontraron albergues con los filtros aplicados")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });

  it("muestra el estado vacío cuando no hay albergues registrados", async () => {
    const { usuario } = renderizar(crearGatewayMemoria([], 0));

    expect(await screen.findByText("Aún no hay albergues registrados")).toBeInTheDocument();

    await usuario.click(screen.getAllByRole("button", { name: "Registrar albergue" })[1]);
    expect(panel().getByRole("heading", { name: "Registrar albergue" })).toBeInTheDocument();
  });

  it("pagina el listado", async () => {
    const { usuario } = renderizar();
    await tablaCargada();

    await usuario.click(screen.getByRole("button", { name: "Página 2" }));

    expect(screen.getByText("Mostrando 6–7 de 7 albergues")).toBeInTheDocument();
    expect(within(screen.getByRole("table")).getByText("Coliseo Cuba")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Página siguiente" })).toBeDisabled();
  });

  it("muestra el error del servidor y permite reintentar", async () => {
    const gateway = crearGatewayMemoria(ALBERGUES_DEMO, 0);
    const listar = vi
      .spyOn(gateway, "listar")
      .mockRejectedValueOnce(new AlberguesError(500, "Ocurrió un error en el servidor. Inténtalo nuevamente."));
    const { usuario } = renderizar(gateway);

    expect(await screen.findByText("No fue posible cargar los albergues")).toBeInTheDocument();
    expect(screen.getByText("Ocurrió un error en el servidor. Inténtalo nuevamente.")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(listar).toHaveBeenCalledTimes(2);
  });

  it("consulta la información completa de un albergue", async () => {
    const { usuario } = renderizar();
    const tabla = await tablaCargada();

    await usuario.click(tabla.getByRole("button", { name: "Consultar Albergue San José" }));

    const detalle = panel();
    expect(detalle.getByRole("heading", { name: "Albergue San José" })).toBeInTheDocument();
    expect(detalle.getByText("Pereira, Risaralda")).toBeInTheDocument();
    expect(detalle.getByText("470 personas")).toBeInTheDocument();
    expect(detalle.getByText("Cra. 7 # 19-45, Centro")).toBeInTheDocument();
  });

  it("muestra errores de validación al registrar con datos incompletos", async () => {
    const { usuario } = renderizar();
    await tablaCargada();

    await usuario.click(screen.getAllByRole("button", { name: "Registrar albergue" })[0]);
    await usuario.click(panel().getByRole("button", { name: /^Registrar$/ }));

    expect(panel().getByText("Revisa los campos marcados antes de continuar.")).toBeInTheDocument();
    expect(panel().getByText("El código es obligatorio.")).toBeInTheDocument();
    expect(panel().getByText("El nombre es obligatorio.")).toBeInTheDocument();
    expect(panel().getByLabelText(/Código del albergue/)).toHaveAttribute("aria-invalid", "true");
    expect(panel().getByLabelText(/Código del albergue/)).toHaveFocus();

    await usuario.type(panel().getByLabelText(/Nombre del albergue/), "Albergue Nuevo");
    expect(panel().queryByText("El nombre es obligatorio.")).not.toBeInTheDocument();
  });

  it("registra un albergue nuevo y lo muestra en el listado", async () => {
    const { usuario } = renderizar();
    await tablaCargada();

    await usuario.click(screen.getAllByRole("button", { name: "Registrar albergue" })[0]);
    const formulario = panel();

    await usuario.type(formulario.getByLabelText(/Código del albergue/), "alb-per-020");
    await usuario.type(formulario.getByLabelText(/Nombre del albergue/), "Albergue La Florida");
    await usuario.type(formulario.getByLabelText(/Departamento/), "Risaralda");
    await usuario.type(formulario.getByLabelText(/Municipio/), "Pereira");
    await usuario.type(formulario.getByLabelText(/Capacidad/), "300");
    await usuario.type(formulario.getByLabelText(/Dirección institucional/), "Vereda La Florida km 3");
    await usuario.type(formulario.getByLabelText(/Latitud/), "4.75");
    await usuario.type(formulario.getByLabelText(/Longitud/), "-75.62");
    await usuario.click(formulario.getByRole("button", { name: /^Registrar$/ }));

    expect(await screen.findByText("El albergue “Albergue La Florida” se registró correctamente.")).toBeInTheDocument();
    expect(within(screen.getByRole("table")).getByText("ALB-PER-020")).toBeInTheDocument();
    expect(screen.getByText("8 centros · 7 activos")).toBeInTheDocument();
  });

  it("muestra el error del servidor cuando el código ya existe", async () => {
    const { usuario } = renderizar();
    const tabla = await tablaCargada();

    await usuario.click(tabla.getByRole("button", { name: "Editar Polideportivo Norte" }));
    const codigo = panel().getByLabelText(/Código del albergue/);
    await usuario.clear(codigo);
    await usuario.type(codigo, "ALB-PER-001");
    await usuario.click(panel().getByRole("button", { name: "Guardar cambios" }));

    expect(await panel().findAllByText("Ya existe un albergue con ese código.")).toHaveLength(2);
    expect(panel().getByLabelText(/Código del albergue/)).toHaveAttribute("aria-invalid", "true");
  });

  it("muestra el estado de guardado y actualiza el albergue al editar", async () => {
    let resolver: (valor: Albergue) => void = () => {};
    const gateway = crearGatewayMemoria(ALBERGUES_DEMO, 0);
    vi.spyOn(gateway, "actualizar").mockImplementation(
      (id, entrada) =>
        new Promise((resolve) => {
          resolver = resolve;
          void id;
          void entrada;
        })
    );
    const { usuario } = renderizar(gateway);
    const tabla = await tablaCargada();

    await usuario.click(tabla.getByRole("button", { name: "Editar Albergue San José" }));
    const nombre = panel().getByLabelText(/Nombre del albergue/);
    await usuario.clear(nombre);
    await usuario.type(nombre, "Albergue San José Renovado");
    await usuario.click(panel().getByRole("button", { name: "Guardar cambios" }));

    expect(panel().getByRole("button", { name: "Guardando…" })).toBeDisabled();

    resolver({ ...ALBERGUES_DEMO[0], nombre: "Albergue San José Renovado" });

    expect(
      await screen.findByText("Los cambios de “Albergue San José Renovado” se guardaron correctamente.")
    ).toBeInTheDocument();
    expect(within(screen.getByRole("table")).getByText("Albergue San José Renovado")).toBeInTheDocument();
  });

  it("pide confirmación antes de desactivar y permite reactivar", async () => {
    const { usuario } = renderizar();
    const tabla = await tablaCargada();

    await usuario.click(tabla.getByRole("button", { name: "Más acciones para Albergue San José" }));
    await usuario.click(screen.getByRole("menuitem", { name: "Desactivar" }));

    expect(panel().getByRole("heading", { name: "Confirmar desactivación" })).toBeInTheDocument();

    await usuario.click(panel().getByRole("button", { name: "Mantener activo" }));
    expect(panel().queryByRole("heading", { name: "Confirmar desactivación" })).not.toBeInTheDocument();

    await usuario.click(panel().getByRole("button", { name: "Desactivar albergue" }));
    await usuario.click(panel().getByRole("button", { name: /^Desactivar$/ }));

    expect(await screen.findByText(/fue desactivado/)).toBeInTheDocument();
    const fila = within(screen.getByRole("table")).getByText("Albergue San José").closest("tr")!;
    expect(within(fila).getByText("Inactivo")).toBeInTheDocument();

    await usuario.click(panel().getByRole("button", { name: "Reactivar albergue" }));
    await usuario.click(panel().getByRole("button", { name: /^Reactivar$/ }));

    expect(await screen.findByText("“Albergue San José” fue reactivado.")).toBeInTheDocument();
  });

  it("informa si falla el cambio de estado", async () => {
    const gateway = crearGatewayMemoria(ALBERGUES_DEMO, 0);
    vi.spyOn(gateway, "cambiarEstado").mockRejectedValue(
      new AlberguesError(403, "No tienes permisos para realizar esta acción.")
    );
    const { usuario } = renderizar(gateway);
    const tabla = await tablaCargada();

    await usuario.click(tabla.getByRole("button", { name: "Consultar Polideportivo Norte" }));
    await usuario.click(panel().getByRole("button", { name: "Desactivar albergue" }));
    await usuario.click(panel().getByRole("button", { name: /^Desactivar$/ }));

    expect(await panel().findByText("No tienes permisos para realizar esta acción.")).toBeInTheDocument();
  });

  it("muestra tarjetas con acciones para celulares", async () => {
    renderizar();
    await tablaCargada();

    const tarjetas = within(screen.getByRole("list", { name: "Albergues registrados" }));
    expect(tarjetas.getAllByRole("listitem")).toHaveLength(5);
    expect(tarjetas.getByRole("button", { name: "Reactivar Complejo Municipal El Roble" })).toBeInTheDocument();
  });

  it("no muestra acciones administrativas a otros roles", async () => {
    const gateway = crearGatewayMemoria(ALBERGUES_DEMO, 0);
    const listar = vi.spyOn(gateway, "listar");

    renderizar(gateway, { rol: "administrador_albergue", demostracion: false });

    expect(screen.getByRole("heading", { name: "Acceso restringido" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Registrar albergue" })).not.toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    await waitFor(() => expect(listar).not.toHaveBeenCalled());
  });

  it("avisa cuando se usan datos de demostración", async () => {
    renderizar(undefined, { rol: "super_administrador", demostracion: true });

    expect(screen.getByText(/Modo demostración/)).toBeInTheDocument();
    await tablaCargada();
  });
});
