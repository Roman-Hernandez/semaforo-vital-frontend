import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { MiAlbergueProvider, useMiAlbergue } from "./use-mi-albergue";
import { miAlbergueGateway, type MiAlbergue } from "@/layers/application/services/mi-albergue-service";

const detalle = { albergue: { id: "albergue-1", nombre: "La Esperanza" } } as MiAlbergue;
afterEach(() => vi.restoreAllMocks());

describe("Sesión compartida del albergue", () => {
  it("comparte una consulta entre consumidores, permite actualizar y recargar", async () => {
    const consultar = vi.spyOn(miAlbergueGateway, "consultar").mockResolvedValue(detalle);
    const { result } = renderHook(() => [useMiAlbergue(), useMiAlbergue()], { wrapper: MiAlbergueProvider });
    await waitFor(() => expect(result.current[0].datos).toEqual(detalle));
    expect(consultar).toHaveBeenCalledTimes(1);
    act(() => result.current[0].setDatos(null));
    expect(result.current[1].datos).toBeNull();
    act(() => result.current[1].recargar());
    await waitFor(() => expect(consultar).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current[0].datos).toEqual(detalle));
  });

  it.each([new Error("Servidor no disponible"), "error desconocido"])("muestra fallo del proveedor y permite reintentar: %s", async (error) => {
    vi.spyOn(miAlbergueGateway, "consultar").mockRejectedValueOnce(error).mockResolvedValue(detalle);
    const { result } = renderHook(useMiAlbergue, { wrapper: MiAlbergueProvider });
    await waitFor(() => expect(result.current.error).toBe(error instanceof Error ? error.message : "No fue posible consultar el albergue."));
    act(() => result.current.recargar());
    await waitFor(() => expect(result.current.datos).toEqual(detalle));
    expect(result.current.error).toBe("");
  });

  it.each([new Error("Sin asignación"), null])("consulta sin proveedor, recupera errores y actualiza datos: %s", async (error) => {
    vi.spyOn(miAlbergueGateway, "consultar").mockRejectedValueOnce(error).mockResolvedValue(detalle);
    const { result } = renderHook(useMiAlbergue);
    await waitFor(() => expect(result.current.error).not.toBe(""));
    act(() => result.current.recargar());
    await waitFor(() => expect(result.current.datos).toEqual(detalle));
    expect(result.current.error).toBe("");
    act(() => result.current.setDatos(null));
    expect(result.current.datos).toBeNull();
  });

  it.each([true, false])("ignora respuesta después de desmontar (proveedor: %s)", async (provider) => {
    let resolve!: (value: MiAlbergue) => void;
    const pending = new Promise<MiAlbergue>((r) => { resolve = r; });
    vi.spyOn(miAlbergueGateway, "consultar").mockReturnValue(pending);
    const hook = renderHook(useMiAlbergue, provider ? { wrapper: MiAlbergueProvider } : {});
    hook.unmount();
    await act(async () => { resolve(detalle); await pending; });
    expect(hook.result.current.datos).toBeNull();
  });
});
