import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../application/services/api-client";
import type { IntervencionesGateway } from "../../application/services/intervenciones-service";
import type { ConsultaPaginada, Page } from "../../application/services/paginacion";
import {
  normalizarIntervencion,
  type Intervencion,
  type IntervencionEntrada,
} from "../../domain/intervenciones/intervencion";
import { IntervencionesPage } from "./intervenciones-page";

const HOY = "2026-11-15";

const SEMILLA: readonly Intervencion[] = [
  {
    id: "int-001",
    tipo: "Agua potable",
    descripcion:
      "Instalación de dos tanques de 1.000 litros con agua tratada en el área común.",
    observaciones: "Se programó revisión del cloro residual cada 48 horas.",
    fecha: "2026-11-12",
    registradoEn: "2026-11-12T15:10:00.000Z",
  },
  {
    id: "int-002",
    tipo: "Saneamiento",
    descripcion:
      "Reparación de cuatro sanitarios y limpieza profunda de las baterías sanitarias.",
    observaciones: "",
    fecha: "2026-11-10",
    registradoEn: "2026-11-10T20:30:00.000Z",
  },
  {
    id: "int-003",
    tipo: "Higiene",
    descripcion:
      "Campaña de lavado de manos con entrega de jabón y alcohol glicerinado a 45 familias.",
    observaciones: "Apoyo de la Secretaría de Salud municipal.",
    fecha: "2026-11-08",
    registradoEn: "2026-11-08T14:00:00.000Z",
  },
  {
    id: "int-004",
    tipo: "Aislamiento temprano",
    descripcion:
      "Habilitación de un espacio de aislamiento para residentes con síntomas respiratorios.",
    observaciones: "",
    fecha: "2026-11-03",
    registradoEn: "2026-11-03T18:45:00.000Z",
  },
];

function crearGatewayTest(
  inicial: readonly Intervencion[] = SEMILLA
): IntervencionesGateway {
  let intervenciones = inicial.map((item) => ({ ...item }));
  let secuencia = intervenciones.length;

  return {
    listar: vi.fn(async (consulta: ConsultaPaginada = {}): Promise<Page<Intervencion>> => {
      const q = (consulta.q ?? "").trim().toLowerCase();
      const desde = consulta.desde ?? "";
      const hasta = consulta.hasta ?? "";

      const filtradas = intervenciones.filter((item) => {
        if (desde && item.fecha < desde) return false;
        if (hasta && item.fecha > hasta) return false;
        if (!q) return true;
        return `${item.tipo} ${item.descripcion} ${item.observaciones}`
          .toLowerCase()
          .includes(q);
      });

      const page = consulta.page ?? 1;
      const pageSize = consulta.page_size ?? 20;
      const offset = (page - 1) * pageSize;
      const items = filtradas.slice(offset, offset + pageSize);
      const total = filtradas.length;
      const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

      return {
        items,
        page,
        page_size: pageSize,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1,
      };
    }),
    registrar: vi.fn(async (entrada: IntervencionEntrada) => {
      secuencia += 1;
      const nueva: Intervencion = {
        ...normalizarIntervencion(entrada),
        id: `int-${String(secuencia).padStart(3, "0")}`,
        registradoEn: new Date().toISOString(),
      };
      intervenciones = [nueva, ...intervenciones];
      return { ...nueva };
    }),
  };
}

function renderizar(gateway: IntervencionesGateway = crearGatewayTest()) {
  const usuario = userEvent.setup();
  render(<IntervencionesPage gateway={gateway} hoy={HOY} />);
  return { usuario, gateway };
}

function formulario() {
  return within(
    screen.getByRole("complementary", { name: "Nueva intervención" })
  );
}

async function llenarFormulario(usuario: ReturnType<typeof userEvent.setup>) {
  const form = formulario();
  await usuario.selectOptions(
    form.getByLabelText(/Tipo de intervención/),
    "Ventilación"
  );
  await usuario.type(
    form.getByLabelText(/Descripción/),
    "Apertura de ventanas en los dormitorios."
  );
  await usuario.type(form.getByLabelText(/Fecha de realización/), "2026-11-14");
}

describe("Intervenciones sanitarias paginadas (/albergue/intervenciones)", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("muestra la carga y luego el historial paginado desde el servidor", async () => {
    renderizar();

    const tabla = within(await screen.findByRole("table"));
    expect(
      screen.getByRole("heading", { name: "Gestión de intervenciones" })
    ).toBeInTheDocument();
    expect(tabla.getByText("12 nov 2026")).toBeInTheDocument();
    expect(tabla.getByText("Agua potable")).toBeInTheDocument();
    expect(tabla.getByText(/Instalación de dos tanques/)).toBeInTheDocument();
  });

  it("filtra en servidor por búsqueda q y fechas, reiniciando a página 1 y permitiendo limpiar filtros", async () => {
    const { usuario, gateway } = renderizar();
    await screen.findByRole("table");

    await usuario.type(screen.getByRole("searchbox"), "jabón");
    await waitFor(() => {
      expect(gateway.listar).toHaveBeenCalledWith(
        expect.objectContaining({ q: "jabón", page: 1 })
      );
    });
    expect(within(screen.getByRole("table")).getByText("Higiene")).toBeInTheDocument();

    await usuario.clear(screen.getByRole("searchbox"));
    await usuario.type(screen.getByRole("searchbox"), "no existe");
    expect(
      await screen.findByText("No hay intervenciones con los filtros aplicados")
    ).toBeInTheDocument();

    await usuario.click(
      screen.getAllByRole("button", { name: /Limpiar filtros/i })[0]
    );
    const tablaRestaurada = within(await screen.findByRole("table"));
    expect(await tablaRestaurada.findByText("Agua potable")).toBeInTheDocument();
  });

  it("registra una intervención, muestra el éxito y recarga la página actual", async () => {
    const { usuario } = renderizar();
    await screen.findByRole("table");

    await llenarFormulario(usuario);
    await usuario.click(
      formulario().getByRole("button", { name: "Guardar intervención" })
    );

    expect(
      await screen.findByText(
        "La intervención de tipo “Ventilación” se registró correctamente."
      )
    ).toBeInTheDocument();
    expect(
      await within(screen.getByRole("table")).findByText(
        "Apertura de ventanas en los dormitorios."
      )
    ).toBeInTheDocument();
  });

  it("muestra el error del servidor si falla la validación", async () => {
    const gateway = crearGatewayTest();
    vi.spyOn(gateway, "registrar").mockRejectedValueOnce(
      new ApiError(422, "Revisa los datos ingresados.", {
        descripcion: "Texto no permitido",
      })
    );
    const { usuario } = renderizar(gateway);
    await screen.findByRole("table");

    await llenarFormulario(usuario);
    await usuario.click(
      formulario().getByRole("button", { name: "Guardar intervención" })
    );

    expect(
      await formulario().findByText("Revisa los datos ingresados.")
    ).toBeInTheDocument();
    expect(formulario().getByText("Texto no permitido")).toBeInTheDocument();
  });
});
