import { describe, expect, it } from "vitest";
import {
  albergueAFormulario,
  calcularOcupacion,
  formularioAEntrada,
  validarAlbergue,
  type Albergue,
  type AlbergueFormulario,
} from "./albergue";

const valido: AlbergueFormulario = {
  codigo: "ALB-PER-010",
  nombre: "Albergue Municipal Norte",
  departamento: "Risaralda",
  municipio: "Pereira",
  direccion: "Cra. 7 # 19-45",
  latitud: "4.8143",
  longitud: "-75.6946",
  capacidadInstalada: "450",
  activo: true,
};

describe("Validación de albergues", () => {
  it("acepta un formulario completo y válido", () => {
    expect(validarAlbergue(valido)).toEqual({});
  });

  it("marca como obligatorios los campos vacíos", () => {
    const errores = validarAlbergue({
      ...valido,
      codigo: " ",
      nombre: "",
      departamento: "",
      municipio: "",
      direccion: "",
      capacidadInstalada: "",
      latitud: "",
      longitud: "",
    });

    expect(Object.keys(errores).sort()).toEqual(
      [
        "capacidadInstalada",
        "codigo",
        "departamento",
        "direccion",
        "latitud",
        "longitud",
        "municipio",
        "nombre",
      ].sort()
    );
    expect(errores.nombre).toBe("El nombre es obligatorio.");
  });

  it("valida el formato del código", () => {
    expect(validarAlbergue({ ...valido, codigo: "alb 01" }).codigo).toMatch(/mayúsculas/);
    expect(validarAlbergue({ ...valido, codigo: "A".repeat(21) }).codigo).toBeDefined();
  });

  it("valida longitudes mínimas y máximas de texto", () => {
    expect(validarAlbergue({ ...valido, nombre: "AB" }).nombre).toMatch(/al menos 3/);
    expect(validarAlbergue({ ...valido, direccion: "x".repeat(161) }).direccion).toMatch(/superar 160/);
  });

  it("valida que la capacidad sea un entero dentro del rango", () => {
    expect(validarAlbergue({ ...valido, capacidadInstalada: "12.5" }).capacidadInstalada).toMatch(/entero/);
    expect(validarAlbergue({ ...valido, capacidadInstalada: "0" }).capacidadInstalada).toMatch(/entre 1/);
    expect(validarAlbergue({ ...valido, capacidadInstalada: "10001" }).capacidadInstalada).toMatch(/entre 1/);
  });

  it("valida el rango y formato de las coordenadas", () => {
    expect(validarAlbergue({ ...valido, latitud: "91" }).latitud).toMatch(/entre -90 y 90/);
    expect(validarAlbergue({ ...valido, longitud: "-181" }).longitud).toMatch(/entre -180 y 180/);
    expect(validarAlbergue({ ...valido, latitud: "abc" }).latitud).toMatch(/número decimal/);
    expect(validarAlbergue({ ...valido, latitud: "4,81" })).toEqual({});
  });
});

describe("Conversión de datos del albergue", () => {
  it("normaliza el formulario antes de enviarlo", () => {
    const entrada = formularioAEntrada({
      ...valido,
      codigo: " alb-per-010 ",
      nombre: "  Albergue Norte ",
      latitud: "4,5",
    });

    expect(entrada).toMatchObject({
      codigo: "ALB-PER-010",
      nombre: "Albergue Norte",
      latitud: 4.5,
      longitud: -75.6946,
      capacidadInstalada: 450,
    });
  });

  const albergue: Albergue = {
    id: "1",
    codigo: "ALB-1",
    nombre: "Uno",
    departamento: "Risaralda",
    municipio: "Pereira",
    direccion: "Calle 1",
    latitud: 4.8,
    longitud: -75.6,
    capacidadInstalada: 200,
    activo: true,
    poblacionActual: 150,
    administrador: null,
    riesgo: null,
    creadoEn: "2026-10-01",
  };

  it("convierte un albergue en valores de formulario", () => {
    expect(albergueAFormulario(albergue)).toMatchObject({
      capacidadInstalada: "200",
      latitud: "4.8",
      longitud: "-75.6",
    });
  });

  it("calcula el porcentaje de ocupación", () => {
    expect(calcularOcupacion(albergue)).toBe(75);
    expect(calcularOcupacion({ ...albergue, poblacionActual: null })).toBeNull();
  });
});
