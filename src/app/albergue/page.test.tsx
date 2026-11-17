import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AlbergueDashboardPage from "@/layers/presentation/pages/albergue-dashboard-page";
import type { MiAlbergueGateway } from "@/layers/application/services/mi-albergue-service";

const gatewayMock: MiAlbergueGateway = {
  consultar: vi.fn(),
  actualizar: vi.fn(),
  consultarPoblacion: vi.fn(),
  guardarPoblacion: vi.fn(),
  listarHistorialPoblacion: vi.fn(),
  consultarDashboard: vi.fn(async () => ({
    albergue: {
      id: "alb-1",
      codigo: "ALB-PER-001",
      nombre: "Albergue San José",
      departamento: "Risaralda",
      municipio: "Pereira",
      direccion: "Cra. 7 # 19-45",
      latitud: 4.8143,
      longitud: -75.6946,
      capacidadInstalada: 200,
      activo: true,
      poblacionActual: 150,
      administrador: "María López",
      riesgo: null,
      creadoEn: "2026-09-18",
    },
    administrador: {
      id: "usr-1",
      nombre: "María",
      apellido: "López",
      email: "maria@semaforo.gob",
    },
    poblacionActual: 150,
    porcentajeOcupacion: 75,
    cuposDisponibles: 50,
    semaforoVital: {
      nivel: "amarillo",
      descripcion: "Riesgo medio",
      fechaCalculo: "2026-11-17T09:00:00Z",
    },
    alertas: {
      cantidad: 2,
      porNivelRiesgo: { verde: 0, amarillo: 2, rojo: 0 },
    },
    casosDiarios: {
      casosEda: 2,
      casosIra: 4,
      ultimaActualizacion: "2026-11-17T08:00:00Z",
    },
    condicionesSanitarias: {
      id: "cs-1",
      fecha: "2026-11-17",
      aguaPotableDisponible: true,
      banosDisponibles: 10,
      estadoHigiene: "Adecuado",
      estadoSaneamiento: "Requiere atención",
      observaciones: "Limpieza programada",
    },
    analisisIa: {
      fechaEjecucion: "2026-11-17T09:00:00Z",
      modeloNombre: "Regresión Logística",
      modeloVersion: "1.0.0",
      probabilidadRiesgo: 0.42,
      registrosConsiderados: 12,
    },
    resumenCasos: [
      { enfermedad: "IRA", cantidadCasosActivos: 4, fecha: "2026-11-17" },
    ],
    intervenciones: [
      {
        id: "int-1",
        fecha: "2026-11-17",
        tipo: "Saneamiento",
        descripcion: "Desinfección de baños",
        observaciones: "",
      },
    ],
    predicciones: [
      {
        simulacionId: "sir-1",
        enfermedad: "IRA",
        fechaEjecucion: "2026-11-17T09:00:00Z",
        modeloNombre: "SIR",
        modeloVersion: "1.0",
        diaFin: 30,
        picoDia: 10,
        picoInfectados: 18,
        finalRecuperados: 40,
      },
    ],
    ultimaActualizacion: "2026-11-17T09:00:00Z",
  })),
};

describe("Panel principal del albergue (/albergue)", () => {
  it("renderiza los indicadores reales del endpoint /api/v1/mi-albergue/dashboard sin avisos demostrativos", async () => {
    render(<AlbergueDashboardPage gateway={gatewayMock} />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Panel del albergue" })
    ).toBeInTheDocument();

    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText(/Riesgo medio/i)).toBeInTheDocument();
    expect(screen.getByText("Desinfección de baños")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.queryByText(/Datos demostrativos/i)).not.toBeInTheDocument();
  });
});
