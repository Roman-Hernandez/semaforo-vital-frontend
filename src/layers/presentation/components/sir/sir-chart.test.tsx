import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SIRChart } from "./sir-chart";
import type { SIRObservation, SIRProjectedDay } from "@/layers/application/services/sir-service";

function observacion(fecha: string, infectados = 10, recuperados: number | null = 20): SIRObservation {
  return { fecha, infectados, recuperados, susceptibles: recuperados === null ? null : 200 - infectados - recuperados,
    poblacion: 200, registro_casos_id: `casos-${fecha}`, registro_poblacion_id: "poblacion" };
}
const proyeccion: SIRProjectedDay[] = [
  { dia: 0, fecha: "2026-11-17", susceptibles: 170, infectados: 10, recuperados: 20 },
  { dia: 1, fecha: "2026-11-18", susceptibles: 168.5, infectados: 10.5, recuperados: 21 },
];
const props = { titulo: "Evolución SIR de IRA", observado: [observacion("2026-11-14"), observacion("2026-11-17")], proyeccion };

function path(container: HTMLElement, serie: string, fuente = "observado") {
  return container.querySelector(`[data-serie="${serie}"] path[data-fuente="${fuente}"]`)!.getAttribute("d")!;
}
function posiciones(d: string) {
  return [...d.matchAll(/[ML]([\d.]+),([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
}

describe("Gráficas SIR: fidelidad de datos e interacción", () => {
  it("ubica los puntos por días transcurridos, no por índice, aunque lleguen desordenados", () => {
    const { container } = render(<SIRChart {...props} observado={[observacion("2026-11-17"), observacion("2026-11-13"), observacion("2026-11-14")]} proyeccion={[]} />);
    const puntos = posiciones(path(container, "infectados"));
    expect(puntos.map(([x]) => x)).toEqual([70, 232.5, 720]);
    expect(puntos[1][0] - puntos[0][0]).toBe((puntos[2][0] - puntos[1][0]) / 3);
    expect(screen.getByText(/Solo hay observaciones/)).toBeInTheDocument();
  });

  it("interrumpe la curva ante valores desconocidos y no los convierte en cero", () => {
    const { container } = render(<SIRChart {...props} observado={[observacion("2026-11-14"), observacion("2026-11-15", 10, null), observacion("2026-11-16")]} proyeccion={[]} />);
    expect(path(container, "recuperados").match(/M/g)).toHaveLength(2);
    expect(path(container, "recuperados")).not.toContain("L");
    expect(path(container, "infectados")).toContain("L");
    fireEvent.change(screen.getByLabelText("Fecha para inspeccionar"), { target: { value: "2026-11-15" } });
    expect(screen.getByText(/Observado/).parentElement).toHaveTextContent("S: Sin dato · I: 10 · R: Sin dato");
  });

  it("distingue la observación y la proyección en la misma fecha y permite consultar el horizonte", () => {
    const { container } = render(<SIRChart {...props} />);
    expect(screen.getByRole("img")).toHaveAccessibleName(/Evolución SIR de IRA/);
    expect(screen.getByText("Fecha: 2026-11-17")).toBeInTheDocument();
    expect(screen.getByText("Proyección (día 0)")).toBeInTheDocument();
    expect(container.querySelector('path[data-fuente="proyectado"]')).toHaveAttribute("stroke-dasharray", "6 4");
    fireEvent.change(screen.getByLabelText("Fecha para inspeccionar"), { target: { value: "2026-11-18" } });
    expect(screen.getByText("Proyección (día 1)").parentElement).toHaveTextContent("S: 168,5 · I: 10,5 · R: 21");
    expect(screen.queryByText("Observado")).not.toBeInTheDocument();
  });

  it("amplía la escala de infectados sin alterar valores y permite volver a las tres series", () => {
    const { container } = render(<SIRChart {...props} />);
    const original = posiciones(path(container, "infectados"))[0][1];
    fireEvent.click(screen.getByRole("button", { name: "Solo infectados" }));
    expect(screen.getByRole("button", { name: "Solo infectados" })).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector('[data-serie="susceptibles"]')).not.toBeInTheDocument();
    expect(posiciones(path(container, "infectados"))[0][1]).toBeLessThan(original);
    expect(screen.getByText("Observado").parentElement).toHaveTextContent("I: 10");
    fireEvent.click(screen.getByRole("button", { name: "Todas las series" }));
    expect(container.querySelectorAll("[data-serie]")).toHaveLength(3);
    expect(posiciones(path(container, "infectados"))[0][1]).toBe(original);
  });

  it("maneja series vacías, un solo punto, cero y cambio de datos sin fechas seleccionadas obsoletas", () => {
    const { container, rerender } = render(<SIRChart {...props} observado={[]} proyeccion={[]} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<SIRChart {...props} observado={[observacion("2026-11-17", 0, 0)]} proyeccion={[]} />);
    expect(posiciones(path(container, "infectados"))).toEqual([[70, 230]]);
    expect(screen.getByText("Observado").parentElement).toHaveTextContent("I: 0 · R: 0");
    rerender(<SIRChart {...props} observado={[]} proyeccion={[proyeccion[1]]} />);
    expect(screen.getByText("Fecha: 2026-11-18")).toBeInTheDocument();
    expect(container.querySelectorAll("circle")).toHaveLength(3);
  });

  it("descarta valores no finitos en la escala y permite inspeccionar con el puntero", () => {
    const { container } = render(<SIRChart {...props} observado={[observacion("2026-11-17", NaN)]} />);
    expect(path(container, "infectados")).not.toContain("NaN");
    expect(screen.getByText("Observado").parentElement).toHaveTextContent("I: Sin dato");
    const targets = container.querySelectorAll('rect[fill="transparent"]');
    fireEvent.mouseEnter(targets[targets.length - 1]);
    expect(screen.getByText("Fecha: 2026-11-18")).toBeInTheDocument();
  });

  it("da etiquetas únicas a varias gráficas y limita las marcas de fecha para historiales largos", () => {
    const observado = Array.from({ length: 28 }, (_, i) => observacion(`2026-10-${String(i + 1).padStart(2, "0")}`));
    render(<><SIRChart {...props} observado={observado} proyeccion={[]} /><SIRChart {...props} titulo="Otra enfermedad" /></>);
    const figures = screen.getAllByRole("figure");
    expect(figures).toHaveLength(2);
    expect(within(figures[0]).getByLabelText("Fecha para inspeccionar").id).not.toBe(within(figures[1]).getByLabelText("Fecha para inspeccionar").id);
    expect(figures[0].querySelectorAll('svg text[y="252"]').length).toBeLessThanOrEqual(5);
  });
});
