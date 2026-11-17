import { describe, expect, it, vi } from "vitest";
import { crearClienteApi } from "./api-client";
import { crearAdministradoresGateway } from "./administradores-service";

function respuesta(status: number, cuerpo: unknown): Response {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Servicio de administradores (/api/v1/administradores)", () => {
  it("lista los administradores paginados incluyendo albergue_nombre y codigo_albergue", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () =>
      respuesta(200, {
        items: [
          {
            id: "507f1f77bcf86cd799439011",
            email: "ana@semaforo.gob",
            role: "administrador_albergue",
            active: true,
            nombre: "Ana",
            apellido: "Ruiz",
            albergue_id: "507f1f77bcf86cd799439022",
            albergue_nombre: "Albergue San José",
            codigo_albergue: "ALB-PER-001",
          },
        ],
        page: 1,
        page_size: 20,
        total: 1,
        total_pages: 1,
        has_next: false,
        has_previous: false,
      })
    );

    const gateway = crearAdministradoresGateway(
      crearClienteApi("https://api.local", () => "token-1", fetchFn)
    );
    const pagina = await gateway.listar({ page: 1, page_size: 20, q: "Ana" });

    expect(fetchFn.mock.calls[0][0]).toBe(
      "https://api.local/api/v1/administradores?page=1&page_size=20&q=Ana"
    );
    expect(pagina.items).toEqual([
      {
        id: "507f1f77bcf86cd799439011",
        email: "ana@semaforo.gob",
        role: "administrador_albergue",
        active: true,
        nombre: "Ana",
        apellido: "Ruiz",
        albergueId: "507f1f77bcf86cd799439022",
        albergueNombre: "Albergue San José",
        codigoAlbergue: "ALB-PER-001",
      },
    ]);
  });

  it("crea, actualiza y asigna albergue a un administrador", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () =>
      respuesta(200, {
        id: "507f1f77bcf86cd799439011",
        email: "ana@semaforo.gob",
        role: "administrador_albergue",
        active: true,
        nombre: "Ana",
        apellido: "Ruiz",
        albergue_id: "507f1f77bcf86cd799439022",
        albergue_nombre: "Albergue San José",
        codigo_albergue: "ALB-PER-001",
      })
    );

    const gateway = crearAdministradoresGateway(
      crearClienteApi("https://api.local", () => "token-1", fetchFn)
    );

    await gateway.crear({
      nombre: "Ana",
      apellido: "Ruiz",
      email: "ana@semaforo.gob",
      password: "Password123!",
      albergueId: "507f1f77bcf86cd799439022",
    });

    await gateway.actualizar("507f1f77bcf86cd799439011", {
      nombre: "Ana María",
      active: false,
    });

    await gateway.asignarAlbergue("507f1f77bcf86cd799439011", null);

    const llamadas = fetchFn.mock.calls.map(([url, init]) => [
      url,
      init?.method,
      init?.body,
    ]);
    expect(llamadas[0][0]).toBe("https://api.local/api/v1/administradores");
    expect(llamadas[0][1]).toBe("POST");
    expect(JSON.parse(String(llamadas[0][2]))).toEqual({
      nombre: "Ana",
      apellido: "Ruiz",
      email: "ana@semaforo.gob",
      password: "Password123!",
      albergue_id: "507f1f77bcf86cd799439022",
    });

    expect(llamadas[1][0]).toBe(
      "https://api.local/api/v1/administradores/507f1f77bcf86cd799439011"
    );
    expect(llamadas[1][1]).toBe("PATCH");
    expect(JSON.parse(String(llamadas[1][2]))).toEqual({
      nombre: "Ana María",
      active: false,
    });

    expect(llamadas[2][0]).toBe(
      "https://api.local/api/v1/administradores/507f1f77bcf86cd799439011/albergue"
    );
    expect(llamadas[2][1]).toBe("PUT");
    expect(JSON.parse(String(llamadas[2][2]))).toEqual({ albergue_id: null });
  });
});

it("actualiza todos los campos sin enviar campos omitidos y crea sin asignación", async () => {
  const fetchFn = vi.fn<typeof fetch>(async () => respuesta(200, { id: "a/b", email: "ana@test.com", role: "administrador_albergue", active: true, nombre: "Ana", apellido: "Ruiz", albergue_id: null }));
  const gateway = crearAdministradoresGateway(crearClienteApi("https://api.local", () => null, fetchFn));
  const created = await gateway.crear({ nombre: " Ana ", apellido: " Ruiz ", email: " ana@test.com ", password: "clave" });
  expect(created.albergueNombre).toBeNull();
  expect(JSON.parse(String(fetchFn.mock.calls[0][1]?.body))).not.toHaveProperty("albergue_id");
  await gateway.actualizar("a/b", { nombre: "Ana", apellido: " Ruiz ", email: " ana@test.com ", active: false, password: "nueva" });
  expect(fetchFn.mock.calls[1][0]).toContain("a%2Fb");
  expect(JSON.parse(String(fetchFn.mock.calls[1][1]?.body))).toEqual({ nombre: "Ana", apellido: "Ruiz", email: "ana@test.com", active: false, password: "nueva" });
  await gateway.actualizar("a/b", {});
  expect(JSON.parse(String(fetchFn.mock.calls[2][1]?.body))).toEqual({});
  await gateway.asignarAlbergue("a/b", "albergue");
  expect(JSON.parse(String(fetchFn.mock.calls[3][1]?.body))).toEqual({ albergue_id: "albergue" });
});
