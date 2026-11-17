import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { paginaVacia, type ConsultaPaginada, type Page } from "@/layers/application/services/paginacion";
import { useListadoPaginado, useValorDebounced } from "./use-listado-paginado";

beforeEach(() => window.history.replaceState({}, "", "/"));
const pagina = (page = 1): Page<string> => ({ ...paginaVacia<string>(page), items: ["registro"], total: 80, total_pages: 4, has_next: page < 4, has_previous: page > 1 });

describe("Paginación compartida", () => {
  it("restaura y actualiza filtros con prefijo sin borrar parámetros ajenos", async () => {
    window.history.replaceState({}, "", "/?otro=valor&hist_page=2&hist_page_size=50&hist_q=agua&hist_desde=2026-11-01&hist_hasta=2026-11-17");
    const fetcher = vi.fn(async (consulta: ConsultaPaginada) => pagina(consulta.page));
    const { result } = renderHook(() => useListadoPaginado({ fetcher, sincronizarUrl: true, prefijoUrl: "hist", debounceMs: 0 }));
    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(fetcher).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, page_size: 50, q: "agua", desde: "2026-11-01", hasta: "2026-11-17" }));
    act(() => result.current.setPage(3));
    await waitFor(() => expect(fetcher).toHaveBeenLastCalledWith(expect.objectContaining({ page: 3 })));
    act(() => result.current.setPageSize(20));
    await waitFor(() => expect(result.current.page).toBe(1));
    act(() => result.current.limpiarFiltros());
    await waitFor(() => expect(window.location.search).toBe("?otro=valor"));
    act(() => result.current.recargar());
    await waitFor(() => expect(result.current.cargando).toBe(false));
  });

  it("reinicia página con fechas y no consulta rangos inválidos", async () => {
    const fetcher = vi.fn(async () => pagina());
    const { result } = renderHook(() => useListadoPaginado({ fetcher, debounceMs: 0 }));
    await waitFor(() => expect(result.current.cargando).toBe(false));
    act(() => { result.current.setDesde("2026-11-10"); result.current.setHasta("2026-11-01"); });
    expect(result.current.error).toBe("");
    expect(result.current.cargando).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(1);
    act(() => result.current.setHasta("2026-11-17"));
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    act(() => result.current.setQ("población"));
    await waitFor(() => expect(fetcher).toHaveBeenLastCalledWith(expect.objectContaining({ q: "población", page: 1 })));
  });

  it("ajusta página fuera de rango después de eliminar registros", async () => {
    const fetcher = vi.fn(async (query: ConsultaPaginada) => query.page === 99 ? { ...paginaVacia<string>(99), total: 80, total_pages: 4 } : pagina(query.page));
    const { result } = renderHook(() => useListadoPaginado({ fetcher }));
    await waitFor(() => expect(result.current.cargando).toBe(false));
    act(() => result.current.setPage(99));
    await waitFor(() => expect(result.current.page).toBe(4));
    await waitFor(() => expect(result.current.items).toEqual(["registro"]));
  });

  it.each([new Error("Sin conexión"), "fallo"])("muestra errores y permite reintentar: %s", async (error) => {
    const fetcher = vi.fn().mockRejectedValueOnce(error).mockResolvedValue(pagina());
    const { result } = renderHook(() => useListadoPaginado({ fetcher, mensajeErrorDefecto: "Reintente" }));
    await waitFor(() => expect(result.current.error).toBe(error instanceof Error ? error.message : "Reintente"));
    act(() => result.current.recargar());
    await waitFor(() => expect(result.current.items).toEqual(["registro"]));
    expect(result.current.error).toBe("");
  });

  it("omite consultas deshabilitadas y reinicia con filtros externos", async () => {
    const fetcher = vi.fn(async () => pagina());
    const { result, rerender } = renderHook(({ enabled, clave }) => useListadoPaginado({ fetcher, habilitado: enabled, claveExtra: clave }), { initialProps: { enabled: false, clave: "uno" } });
    expect(fetcher).not.toHaveBeenCalled();
    rerender({ enabled: true, clave: "uno" });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    act(() => result.current.setPage(2));
    await waitFor(() => expect(result.current.cargando).toBe(false));
    rerender({ enabled: true, clave: "dos" });
    await waitFor(() => expect(result.current.page).toBe(1));
  });

  it("descarta una respuesta y un error antiguos ante búsquedas nuevas", async () => {
    let resolve!: (value: Page<string>) => void;
    let reject!: (error: Error) => void;
    const fetcher = vi.fn().mockImplementationOnce(() => new Promise<Page<string>>((r) => { resolve = r; })).mockImplementationOnce(() => new Promise<Page<string>>((_, r) => { reject = r; })).mockResolvedValue(pagina());
    const { result } = renderHook(() => useListadoPaginado({ fetcher, debounceMs: 0 }));
    act(() => result.current.setQ("primera"));
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    act(() => result.current.setQ("definitiva"));
    await waitFor(() => expect(result.current.items).toEqual(["registro"]));
    await act(async () => { resolve(paginaVacia()); reject(new Error("viejo")); });
    expect(result.current.items).toEqual(["registro"]);
    expect(result.current.error).toBe("");
  });

  it("aplica debounce y limpiar no espera al temporizador", async () => {
    const { result, rerender } = renderHook(({ value }) => useValorDebounced(value, 25), { initialProps: { value: "uno" } });
    rerender({ value: "dos" });
    expect(result.current).toBe("uno");
    await waitFor(() => expect(result.current).toBe("dos"));
    rerender({ value: "" });
    expect(result.current).toBe("");
  });
});
