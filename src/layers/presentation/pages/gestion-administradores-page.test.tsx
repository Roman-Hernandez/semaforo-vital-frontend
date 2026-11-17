import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type {
  Administrador,
  AdministradoresGateway,
} from "@/layers/application/services/administradores-service";
import type { ConsultaPaginada, Page } from "@/layers/application/services/paginacion";
import {
  GestionAdministradoresPage,
  type AlbergueResumen,
} from "./gestion-administradores-page";

const ALBERGUES: AlbergueResumen[] = [
  {
    id: "507f1f77bcf86cd799439022",
    codigo: "ALB-PER-001",
    nombre: "Albergue San José",
  },
  {
    id: "507f1f77bcf86cd799439033",
    codigo: "ALB-DOS-002",
    nombre: "Polideportivo Norte",
  },
];

function envolverPagina<T>(items: T[]): Page<T> {
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

function crearGatewayMock(): AdministradoresGateway {
  let admins: Administrador[] = [
    {
      id: "507f1f77bcf86cd799439011",
      email: "maria@semaforo.gob",
      role: "administrador_albergue",
      active: true,
      nombre: "María",
      apellido: "López",
      albergueId: "507f1f77bcf86cd799439022",
      albergueNombre: "Albergue San José",
      codigoAlbergue: "ALB-PER-001",
    },
  ];

  return {
    listar: vi.fn(async (consulta: ConsultaPaginada = {}) => {
      const q = (consulta.q ?? "").trim().toLowerCase();
      const filtrados = q
        ? admins.filter((a) =>
            `${a.nombre ?? ""} ${a.apellido ?? ""} ${a.email}`
              .toLowerCase()
              .includes(q)
          )
        : [...admins];
      return envolverPagina(filtrados);
    }),
    crear: vi.fn(async (entrada) => {
      const alb = ALBERGUES.find((a) => a.id === entrada.albergueId);
      const nuevo: Administrador = {
        id: "507f1f77bcf86cd799439099",
        email: entrada.email,
        role: "administrador_albergue",
        active: true,
        nombre: entrada.nombre,
        apellido: entrada.apellido,
        albergueId: entrada.albergueId ?? null,
        albergueNombre: alb?.nombre ?? null,
        codigoAlbergue: alb?.codigo ?? null,
      };
      admins = [nuevo, ...admins];
      return nuevo;
    }),
    actualizar: vi.fn(async (id, cambios) => {
      const actual = admins.find((a) => a.id === id)!;
      const actualizado = {
        ...actual,
        nombre: cambios.nombre ?? actual.nombre,
        apellido: cambios.apellido ?? actual.apellido,
        email: cambios.email ?? actual.email,
        active: cambios.active ?? actual.active,
      };
      admins = admins.map((a) => (a.id === id ? actualizado : a));
      return actualizado;
    }),
    asignarAlbergue: vi.fn(async (id, albergueId) => {
      const actual = admins.find((a) => a.id === id)!;
      const alb = ALBERGUES.find((a) => a.id === albergueId);
      const actualizado = {
        ...actual,
        albergueId,
        albergueNombre: alb?.nombre ?? null,
        codigoAlbergue: alb?.codigo ?? null,
      };
      admins = admins.map((a) => (a.id === id ? actualizado : a));
      return actualizado;
    }),
  };
}

describe("Gestión de administradores paginada (/gestion/administradores)", () => {
  it("lista los administradores mostrando albergue_nombre y codigo_albergue devueltos por el servidor sin llamadas por fila", async () => {
    const gateway = crearGatewayMock();
    render(
      <GestionAdministradoresPage
        gateway={gateway}
        listarAlbergues={async () => envolverPagina(ALBERGUES)}
      />
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Administradores de albergues",
      })
    ).toBeInTheDocument();

    const tabla = within(await screen.findByRole("table"));
    expect(tabla.getByText("María López")).toBeInTheDocument();
    expect(tabla.getByText("maria@semaforo.gob")).toBeInTheDocument();
    expect(
      tabla.getByText("Albergue San José (ALB-PER-001)")
    ).toBeInTheDocument();
  });

  it("permite registrar un nuevo administrador y asignarle un albergue desde el selector paginado", async () => {
    const usuario = userEvent.setup();
    const gateway = crearGatewayMock();
    render(
      <GestionAdministradoresPage
        gateway={gateway}
        listarAlbergues={async () => envolverPagina(ALBERGUES)}
      />
    );

    await screen.findByRole("table");

    await usuario.type(screen.getByLabelText(/Nombre \*/i), "Carlos");
    await usuario.type(screen.getByLabelText(/Apellido \*/i), "Méndez");
    await usuario.type(
      screen.getByLabelText(/Correo electrónico \*/i),
      "carlos@semaforo.gob"
    );
    await usuario.type(
      screen.getByLabelText(/Contraseña \*/i),
      "ClaveSegura123"
    );
    await usuario.selectOptions(
      screen.getByLabelText(/Albergue asignado/i),
      "507f1f77bcf86cd799439033"
    );

    await usuario.click(
      screen.getByRole("button", { name: "Crear administrador" })
    );

    await waitFor(() => {
      expect(gateway.crear).toHaveBeenCalledWith({
        nombre: "Carlos",
        apellido: "Méndez",
        email: "carlos@semaforo.gob",
        password: "ClaveSegura123",
        albergueId: "507f1f77bcf86cd799439033",
      });
    });

    expect(await screen.findByText("Carlos Méndez")).toBeInTheDocument();
  });
});
