import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  Albergue,
  AlbergueEntrada,
} from "@/layers/domain/albergues/albergue";
import {
  AlberguesError,
  type AlberguesGateway,
} from "@/layers/application/services/albergues-service";
import type { ConsultaPaginada, Page } from "@/layers/application/services/paginacion";
import type { Sesion } from "@/layers/application/services/sesion";
import { GestionAlberguesPage } from "./gestion-albergues-page";

const SEMILLA: Albergue[] = [
  {
    id: "alb-001",
    codigo: "ALB-PER-001",
    nombre: "Albergue San José",
    departamento: "Risaralda",
    municipio: "Pereira",
    direccion: "Cra. 7 # 19-45, Centro",
    latitud: 4.8143,
    longitud: -75.6946,
    capacidadInstalada: 470,
    activo: true,
    poblacionActual: null,
    administrador: "María López",
    riesgo: null,
    creadoEn: "2026-09-18",
  },
  {
    id: "alb-002",
    codigo: "ALB-DOS-002",
    nombre: "Polideportivo Norte",
    departamento: "Risaralda",
    municipio: "Dosquebradas",
    direccion: "Av. Simón Bolívar # 35-10",
    latitud: 4.8395,
    longitud: -75.6673,
    capacidadInstalada: 428,
    activo: true,
    poblacionActual: 180,
    administrador: null,
    riesgo: "critico",
    creadoEn: "2026-09-20",
  },
  {
    id: "alb-005",
    codigo: "ALB-BEL-005",
    nombre: "Complejo Municipal El Roble",
    departamento: "Risaralda",
    municipio: "Belén de Umbría",
    direccion: "Vereda El Roble, km 2",
    latitud: 5.2001,
    longitud: -75.8689,
    capacidadInstalada: 341,
    activo: false,
    poblacionActual: null,
    administrador: null,
    riesgo: null,
    creadoEn: "2026-09-27",
  },
];

function envolver<T>(items: T[]): Page<T> {
  return {
    items,
    page: 1,
    page_size: 20,
    total: items.length,
    total_pages: items.length > 0 ? 1 : 0,
    has_next: false,
    has_previous: false,
  };
}

function crearGatewayTest(inicial: Albergue[] = SEMILLA): AlberguesGateway {
  let albergues = inicial.map((item) => ({ ...item }));
  let seq = albergues.length;

  return {
    resumen: vi.fn(async () => ({
      totalRegistrados: albergues.length,
      totalActivos: albergues.filter((a) => a.activo).length,
      conAdministrador: albergues.filter((a) => a.administrador).length,
      criticos: albergues.filter((a) => a.riesgo === "critico").length,
      sinClasificacion: albergues.filter((a) => a.riesgo === null).length,
      poblacionActual: null,
      alberguesSinPoblacion: albergues.filter((a) => a.poblacionActual === null)
        .length,
      porcentajeOcupacion: 42,
    })),
    listar: vi.fn(async (consulta: ConsultaPaginada = {}) => {
      const q = (consulta.q ?? "").trim().toLowerCase();
      const filtrados = albergues.filter((a) => {
        if (consulta.activo !== undefined && a.activo !== consulta.activo) {
          return false;
        }
        if (!q) return true;
        return `${a.nombre} ${a.codigo} ${a.municipio} ${a.departamento}`
          .toLowerCase()
          .includes(q);
      });
      const page = consulta.page ?? 1;
      const pageSize = consulta.page_size ?? 20;
      const offset = (page - 1) * pageSize;
      const items = filtrados.slice(offset, offset + pageSize);
      const total = filtrados.length;
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
    crear: vi.fn(async (entrada: AlbergueEntrada) => {
      seq += 1;
      const nuevo: Albergue = {
        ...entrada,
        id: `alb-00${seq}`,
        codigo: "ALB-GENERADO",
        poblacionActual: null,
        administrador: null,
        riesgo: null,
        creadoEn: "2026-11-17",
      };
      albergues = [nuevo, ...albergues];
      return { ...nuevo };
    }),
    actualizar: vi.fn(async (id: string, entrada: AlbergueEntrada) => {
      const actual = albergues.find((a) => a.id === id);
      if (!actual) throw new AlberguesError(404, "No encontrado");
      const actualizado = { ...actual, ...entrada };
      albergues = albergues.map((a) => (a.id === id ? actualizado : a));
      return { ...actualizado };
    }),
    cambiarEstado: vi.fn(async (id: string, activo: boolean) => {
      const actual = albergues.find((a) => a.id === id);
      if (!actual) throw new AlberguesError(404, "No encontrado");
      const actualizado = { ...actual, activo };
      albergues = albergues.map((a) => (a.id === id ? actualizado : a));
      return { ...actualizado };
    }),
    consultarRegistros: vi.fn(async () => ({
      condiciones: envolver([
        {
          id: "cs-1",
          fecha: "2026-11-17",
          aguaPotableDisponible: true,
          banosDisponibles: 8,
          estadoHigiene: "Adecuado",
          estadoSaneamiento: "Adecuado",
          observaciones: "",
        },
      ]),
      enfermedades: envolver([
        {
          id: "enf-1",
          fecha: "2026-11-17",
          enfermedad: "IRA",
          cantidadCasosActivos: 3,
          cantidadRecuperados: 1,
          observaciones: "",
        },
      ]),
      intervenciones: envolver([
        {
          id: "int-1",
          fecha: "2026-11-17",
          tipo: "Agua potable",
          descripcion: "Cloración de tanques",
          observaciones: "",
        },
      ]),
    })),
  };
}

const superAdmin: Sesion = {
  rol: "super_administrador",
  usuario: null,
  demostracion: false,
};

function renderizar(
  gateway: AlberguesGateway = crearGatewayTest(),
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
  return within(
    screen.getByRole("complementary", {
      name: "Detalle y formulario del albergue",
    })
  );
}

describe("Gestión de albergues paginada (/gestion/albergues)", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("muestra el resumen global desde /albergues/resumen y el listado paginado conservando null en población y riesgo", async () => {
    const { gateway } = renderizar();

    const tabla = await tablaCargada();

    expect(
      screen.getByRole("heading", { name: "Gestión de albergues" })
    ).toBeInTheDocument();
    expect(gateway.resumen).toHaveBeenCalled();
    expect(tabla.getByText("Albergue San José")).toBeInTheDocument();
    expect(tabla.getByText("ALB-PER-001")).toBeInTheDocument();
    expect(tabla.getByText("470 personas")).toBeInTheDocument();
    // Población null se muestra como "Sin dato", no como "0"
    expect(tabla.getAllByText("Sin dato").length).toBeGreaterThanOrEqual(1);
    expect(tabla.getAllByText("Sin evaluar").length).toBeGreaterThanOrEqual(
      1
    );
  });

  it("permite filtrar en servidor por estado y búsqueda reiniciando a página 1", async () => {
    const { usuario, gateway } = renderizar();
    await tablaCargada();

    await usuario.selectOptions(
      screen.getByLabelText("Filtrar por estado"),
      "inactivos"
    );
    await waitFor(() => {
      expect(gateway.listar).toHaveBeenCalledWith(
        expect.objectContaining({ activo: false, page: 1 })
      );
    });
    expect(
      await within(screen.getByRole("table")).findByText(
        "Complejo Municipal El Roble"
      )
    ).toBeInTheDocument();

    await usuario.selectOptions(
      screen.getByLabelText("Filtrar por estado"),
      "todos"
    );
    await usuario.type(screen.getByRole("searchbox"), "dosquebradas");
    expect(
      await within(screen.getByRole("table")).findByText("Polideportivo Norte")
    ).toBeInTheDocument();
  });

  it("consulta el detalle de un albergue y sus registros sanitarios globales paginados", async () => {
    const { usuario, gateway } = renderizar();
    const tabla = await tablaCargada();

    await usuario.click(
      tabla.getByRole("button", { name: "Consultar Albergue San José" })
    );

    const detalle = panel();
    expect(
      detalle.getByRole("heading", { name: "Albergue San José" })
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(gateway.consultarRegistros).toHaveBeenCalledWith(
        "alb-001",
        expect.objectContaining({ page: 1 })
      );
    });
    expect(await detalle.findByText(/Cloración de tanques/)).toBeInTheDocument();
  });

  it("registra un albergue nuevo y refresca el listado y resumen", async () => {
    const { usuario } = renderizar();
    await tablaCargada();

    await usuario.click(
      screen.getAllByRole("button", { name: "Registrar albergue" })[0]
    );
    const formulario = panel();

    expect(
      formulario.queryByLabelText(/Código del albergue/)
    ).not.toBeInTheDocument();
    await usuario.type(
      formulario.getByLabelText(/Nombre del albergue/),
      "Albergue La Florida"
    );
    await usuario.type(formulario.getByLabelText(/Departamento/), "Risaralda");
    await usuario.type(formulario.getByLabelText(/Municipio/), "Pereira");
    await usuario.type(formulario.getByLabelText(/Capacidad/), "300");
    await usuario.type(
      formulario.getByLabelText(/Dirección institucional/),
      "Vereda La Florida km 3"
    );
    await usuario.type(formulario.getByLabelText(/Latitud/), "4.75");
    await usuario.type(formulario.getByLabelText(/Longitud/), "-75.62");
    await usuario.click(
      formulario.getByRole("button", { name: /^Registrar$/ })
    );

    expect(
      await screen.findByText(
        "El albergue “Albergue La Florida” se registró correctamente."
      )
    ).toBeInTheDocument();
    expect(
      await within(screen.getByRole("table")).findByText("ALB-GENERADO")
    ).toBeInTheDocument();
  });

  it("restringe el acceso si el rol no es super_administrador", async () => {
    const gateway = crearGatewayTest();
    renderizar(gateway, {
      rol: "administrador_albergue",
      usuario: null,
      demostracion: false,
    });

    expect(
      screen.getByRole("heading", { name: "Acceso restringido" })
    ).toBeInTheDocument();
    await waitFor(() => expect(gateway.listar).not.toHaveBeenCalled());
  });

  it("navega a página 2, reinicia a página 1 al filtrar y descarta respuestas antiguas fuera de orden", async () => {
    const veintiuno: Albergue[] = Array.from({ length: 21 }, (_, idx) => ({
      ...SEMILLA[0],
      id: `alb-p-${idx + 1}`,
      codigo: `ALB-P-${String(idx + 1).padStart(3, "0")}`,
      nombre: idx === 20 ? "Albergue Página Dos" : `Albergue ${idx + 1}`,
      municipio: idx === 0 ? "Quinchía" : "Pereira",
    }));

    const gateway = crearGatewayTest(veintiuno);
    const { usuario } = renderizar(gateway);
    await tablaCargada();

    // Página 1 tiene 20 registros; vamos a página 2
    await usuario.click(
      screen.getAllByRole("button", { name: "Página siguiente" })[0]
    );
    expect(
      await within(screen.getByRole("table")).findByText("Albergue Página Dos")
    ).toBeInTheDocument();
    expect(gateway.listar).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, page_size: 20 })
    );

    // Preparamos una respuesta lenta para un filtro intermedio y una rápida para el filtro final
    let resolverLenta!: (valor: Page<Albergue>) => void;
    const baseGateway = crearGatewayTest(veintiuno);
    vi.mocked(gateway.listar).mockImplementation((consulta: ConsultaPaginada = {}) => {
      if (consulta.q === "lento") {
        return new Promise<Page<Albergue>>((resolve) => {
          resolverLenta = resolve;
        });
      }
      return baseGateway.listar(consulta);
    });

    await usuario.selectOptions(
      screen.getByLabelText("Filtrar por estado"),
      "activos"
    );
    await waitFor(() => {
      expect(gateway.listar).toHaveBeenCalledWith(
        expect.objectContaining({ activo: true, page: 1 })
      );
    });

    // Disparamos petición lenta y luego petición rápida
    await usuario.type(screen.getByRole("searchbox"), "lento");
    await waitFor(() => {
      expect(gateway.listar).toHaveBeenCalledWith(
        expect.objectContaining({ q: "lento", page: 1 })
      );
    });

    await usuario.clear(screen.getByRole("searchbox"));
    await usuario.type(screen.getByRole("searchbox"), "Quinchía");
    await waitFor(() => {
      expect(gateway.listar).toHaveBeenCalledWith(
        expect.objectContaining({ q: "Quinchía", page: 1 })
      );
    });
    expect(
      await within(screen.getByRole("table")).findByText("Albergue 1")
    ).toBeInTheDocument();

    // Resolvemos la respuesta antigua después; no debe sobrescribir "Albergue 1"
    resolverLenta?.({
      items: [
        {
          ...SEMILLA[0],
          id: "alb-obsoleto",
          codigo: "ALB-OBS",
          nombre: "Albergue Obsoleto",
        },
      ],
      page: 1,
      page_size: 20,
      total: 1,
      total_pages: 1,
      has_next: false,
      has_previous: false,
    });

    await waitFor(() => {
      expect(
        within(screen.getByRole("table")).queryByText("Albergue Obsoleto")
      ).not.toBeInTheDocument();
      expect(
        within(screen.getByRole("table")).getByText("Albergue 1")
      ).toBeInTheDocument();
    });
  });
});
