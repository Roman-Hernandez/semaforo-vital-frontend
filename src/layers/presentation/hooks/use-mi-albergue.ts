"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  miAlbergueGateway,
  type MiAlbergue,
} from "@/layers/application/services/mi-albergue-service";

export interface MiAlbergueEstado {
  readonly datos: MiAlbergue | null;
  readonly setDatos: (datos: MiAlbergue | null) => void;
  readonly error: string;
  readonly recargar: () => void;
}

export const MiAlbergueContext = createContext<MiAlbergueEstado | null>(null);

export function MiAlbergueProvider({ children }: { readonly children: ReactNode }) {
  const [datos, setDatos] = useState<MiAlbergue | null>(null);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    miAlbergueGateway
      .consultar()
      .then((resultado) => {
        if (vigente) {
          setDatos(resultado);
          setError("");
        }
      })
      .catch((err: unknown) => {
        if (vigente) {
          setError(
            err instanceof Error ? err.message : "No fue posible consultar el albergue."
          );
        }
      });
    return () => {
      vigente = false;
    };
  }, [intento]);

  const valor = useMemo<MiAlbergueEstado>(
    () => ({
      datos,
      setDatos,
      error,
      recargar: () => {
        setError("");
        setIntento((n) => n + 1);
      },
    }),
    [datos, error]
  );

  return createElement(MiAlbergueContext.Provider, { value: valor }, children);
}

export function useMiAlbergue(): MiAlbergueEstado {
  const ctx = useContext(MiAlbergueContext);
  const [datos, setDatos] = useState<MiAlbergue | null>(null);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (ctx) return;
    let vigente = true;
    miAlbergueGateway
      .consultar()
      .then((resultado) => {
        if (vigente) {
          setDatos(resultado);
          setError("");
        }
      })
      .catch((err: unknown) => {
        if (vigente) {
          setError(
            err instanceof Error ? err.message : "No fue posible consultar el albergue."
          );
        }
      });
    return () => {
      vigente = false;
    };
  }, [ctx, intento]);

  if (ctx) return ctx;

  return {
    datos,
    setDatos,
    error,
    recargar: () => {
      setError("");
      setIntento((n) => n + 1);
    },
  };
}
