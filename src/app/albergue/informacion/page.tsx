"use client";

import { useState, type FormEvent } from "react";
import { miAlbergueGateway } from "@/layers/application/services/mi-albergue-service";
import {
  albergueAFormulario,
  formularioAEntrada,
  validarAlbergue,
  type Albergue,
  type AlbergueFormulario,
} from "@/layers/domain/albergues/albergue";
import { useMiAlbergue } from "@/layers/presentation/hooks/use-mi-albergue";
import { EstadoBadge } from "@/layers/presentation/components/albergues/insignias";
import { SelectorCoordenadasMapa } from "@/components/shared/SelectorCoordenadasMapa";
import { SkeletonBloque } from "@/components/shared/Skeleton";

const campos = [
  ["capacidadInstalada", "Capacidad máxima", "number"],
  ["departamento", "Departamento", "text"],
  ["municipio", "Municipio", "text"],
  ["direccion", "Dirección", "text"],
] as const;

function Formulario({
  albergue,
  onGuardar,
  onCancelar,
}: {
  readonly albergue: Albergue;
  readonly onGuardar: (albergue: Albergue) => void;
  readonly onCancelar: () => void;
}) {
  const [form, setForm] = useState<AlbergueFormulario>(() =>
    albergueAFormulario(albergue)
  );
  const [errores, setErrores] = useState<ReturnType<typeof validarAlbergue>>({});
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function guardar(event: FormEvent) {
    event.preventDefault();
    if (guardando) return;
    const validacion = validarAlbergue(form);
    delete validacion.nombre;
    delete validacion.codigo;
    setErrores(validacion);
    if (Object.keys(validacion).length) return;
    setGuardando(true);
    setError("");
    try {
      onGuardar(await miAlbergueGateway.actualizar(formularioAEntrada(form)));
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "No fue posible guardar los cambios."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form
      onSubmit={guardar}
      noValidate
      aria-busy={guardando}
      className="anim-entrada space-y-4 border-t-2 border-[#008994] bg-white p-6 shadow-xs"
    >
      <h2 className="text-base font-bold text-[#164652]">Editar información</h2>
      <fieldset disabled={guardando} className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Ubicación y capacidad del albergue</legend>
        {campos.map(([campo, label, type]) => (
          <div key={campo}>
            <label
              htmlFor={`albergue-${campo}`}
              className="block text-xs font-semibold text-[#164652]"
            >
              {label}
            </label>
            <input
              id={`albergue-${campo}`}
              type={type}
              value={String(form[campo])}
              required
              min={type === "number" ? 1 : undefined}
              step={type === "number" ? 1 : undefined}
              aria-invalid={Boolean(errores[campo])}
              aria-describedby={errores[campo] ? `error-${campo}` : undefined}
              onChange={(event) =>
                setForm((actual) => ({ ...actual, [campo]: event.target.value }))
              }
              className="mt-1 h-10 w-full border border-[#DCE6EA] bg-white px-3 text-sm text-[#164652] outline-none focus:border-[#008994]"
            />
            {errores[campo] && (
              <p id={`error-${campo}`} className="mt-1 text-xs text-[#C53030]">
                {errores[campo]}
              </p>
            )}
          </div>
        ))}
        <div className="sm:col-span-2">
          <SelectorCoordenadasMapa
            latitud={form.latitud}
            longitud={form.longitud}
            errorLatitud={errores.latitud}
            errorLongitud={errores.longitud}
            disabled={guardando}
            onChange={(latitud, longitud) => {
              setForm((actual) => ({ ...actual, latitud, longitud }));
            }}
          />
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="text-xs text-[#C53030]">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={guardando}
          className="bg-[#008994] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#00747E]"
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
        <button
          type="button"
          disabled={guardando}
          onClick={onCancelar}
          className="border border-[#DCE6EA] bg-white px-4 py-2 text-xs font-semibold text-[#164652] hover:bg-[#F4F8FA]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function InformacionAlberguePage() {
  const { datos, setDatos, error, recargar } = useMiAlbergue();
  const [editando, setEditando] = useState(false);
  const [aviso, setAviso] = useState("");

  return (
    <div className="anim-entrada mx-auto max-w-4xl space-y-6 text-[#164652]">
      <header className="flex flex-col justify-between gap-3 border-b border-[#DCE6EA] pb-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-[#164652]">
          Información del albergue
        </h1>

        {datos?.albergue.activo && !editando && (
          <button
            type="button"
            className="self-start bg-[#008994] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#00747E] sm:self-auto"
            onClick={() => {
              setAviso("");
              setEditando(true);
            }}
          >
            Editar información
          </button>
        )}
      </header>

      {aviso && (
        <output className="block border-l-4 border-[#168052] bg-white p-3 text-xs font-medium text-[#168052]">
          {aviso}
        </output>
      )}

      {error ? (
        <div
          role="alert"
          className="border-l-4 border-[#C53030] bg-white p-4 text-sm text-[#C53030]"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={recargar}
            className="mt-2 border border-[#DCE6EA] bg-white px-3 py-1.5 text-xs font-semibold text-[#164652]"
          >
            Reintentar
          </button>
        </div>
      ) : !datos ? (
        <SkeletonBloque filas={5} etiqueta="Cargando albergue…" />
      ) : (
        <>
          {editando && (
            <Formulario
              albergue={datos.albergue}
              onCancelar={() => setEditando(false)}
              onGuardar={(albergue) => {
                setDatos({ ...datos, albergue });
                setEditando(false);
                setAviso("La información del albergue se actualizó correctamente.");
              }}
            />
          )}

          <section className="border-t-2 border-[#008994] bg-white p-6 shadow-xs">
            <div className="flex items-start justify-between gap-3 border-b border-[#EEF2F4] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#164652]">
                  {datos.albergue.nombre}
                </h2>
                <p className="text-xs text-[#718895]">{datos.albergue.codigo}</p>
              </div>
              <EstadoBadge activo={datos.albergue.activo} />
            </div>

            <dl className="mt-4 divide-y divide-[#EEF2F4] text-sm">
              <div className="flex justify-between py-3">
                <dt className="text-xs text-[#53636B]">Dirección</dt>
                <dd className="font-semibold">{datos.albergue.direccion}</dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-xs text-[#53636B]">Ubicación</dt>
                <dd className="font-semibold">
                  {datos.albergue.municipio}, {datos.albergue.departamento}
                </dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-xs text-[#53636B]">Capacidad máxima</dt>
                <dd className="font-semibold">
                  {datos.albergue.capacidadInstalada} personas
                </dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-xs text-[#53636B]">Administrador</dt>
                <dd className="font-semibold">
                  {[datos.administrador.nombre, datos.administrador.apellido]
                    .filter(Boolean)
                    .join(" ") || "Nombre no registrado"}
                </dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-xs text-[#53636B]">Correo electrónico</dt>
                <dd className="font-semibold">{datos.administrador.email}</dd>
              </div>
            </dl>
          </section>
        </>
      )}
    </div>
  );
}
