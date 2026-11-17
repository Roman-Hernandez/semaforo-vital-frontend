"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import {
  guardarToken,
  guardarUsuarioSesion,
  rutaPorRol,
  type UsuarioSesion,
} from "@/layers/application/services/sesion";

export default function LoginPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [tipoMensaje, setTipoMensaje] = useState<"exito" | "error" | "info" | "">("");

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cargando) return;

    setCargando(true);
    setMensaje("Validando credenciales...");
    setTipoMensaje("info");

    const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

    try {
      const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: correo.trim(),
          password: contrasena,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail?.[0]?.msg ||
            (typeof data.detail === "string" ? data.detail : null) ||
            "Correo o contraseña incorrectos."
        );
      }

      if (!data.access_token) {
        throw new Error("El servidor no devolvió el token de acceso.");
      }

      let perfil: UsuarioSesion | undefined;
      try {
        const meResponse = await fetch(`${baseUrl}/api/v1/auth/me`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${data.access_token}`,
          },
        });
        if (meResponse.ok) {
          perfil = (await meResponse.json()) as UsuarioSesion;
        }
      } catch {
        // Si /me falla en un entorno aislado, guardarToken respalda con la lectura única del JWT.
      }

      const rol = guardarToken(data.access_token, perfil);
      if (perfil) {
        guardarUsuarioSesion(perfil);
      }

      setMensaje("Acceso verificado.");
      setTipoMensaje("exito");

      router.push(rutaPorRol(rol));
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "No fue posible conectar con el servidor."
      );
      setTipoMensaje("error");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F8FA] p-4 sm:p-6 lg:p-10">
      <section className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-[#DCE6EA] bg-white shadow-lg min-[761px]:grid-cols-2">
        {/* Panel ilustrativo */}
        <div className="relative min-h-[340px] overflow-hidden bg-[#E8F6F8] max-[760px]:hidden md:min-h-[540px]">
          <Image
            src="/loginImagen.png"
            alt="Ilustración institucional de Semáforo Vital"
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-cover object-center"
          />
        </div>

        {/* Formulario */}
        <div className="flex items-center justify-center px-6 py-8 sm:px-10">
          <div className="w-full max-w-sm">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center">
                <Image
                  src="/icono.png"
                  alt="Logo de Semáforo Vital"
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain"
                />
              </div>
              <h1 className="text-xl font-bold text-[#164652]">Semáforo Vital</h1>
              <p className="mt-1 text-xs text-[#53636B]">
                Ingreso al sistema de gestión y vigilancia sanitaria
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="correo"
                  className="mb-1.5 block text-xs font-semibold text-[#164652]"
                >
                  Correo electrónico
                </label>

                <input
                  id="correo"
                  name="correo"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="nombre@institucion.gob"
                  value={correo}
                  onChange={(event) => {
                    setCorreo(event.target.value);
                    setMensaje("");
                    setTipoMensaje("");
                  }}
                  required
                  className="h-11 w-full rounded-lg border border-[#DCE6EA] bg-white px-3 text-sm text-[#164652] outline-none transition placeholder:text-[#98A8AE] focus:border-[#008994] focus:ring-2 focus:ring-[#008994]/15"
                />
              </div>

              <div>
                <label
                  htmlFor="contrasena"
                  className="mb-1.5 block text-xs font-semibold text-[#164652]"
                >
                  Contraseña
                </label>

                <div className="flex h-11 items-center gap-2 rounded-lg border border-[#DCE6EA] bg-white px-3 transition focus-within:border-[#008994] focus-within:ring-2 focus-within:ring-[#008994]/15">
                  <input
                    id="contrasena"
                    name="contrasena"
                    type={mostrarContrasena ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Ingresa tu contraseña"
                    value={contrasena}
                    onChange={(event) => {
                      setContrasena(event.target.value);
                      setMensaje("");
                      setTipoMensaje("");
                    }}
                    required
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#164652] outline-none placeholder:text-[#98A8AE]"
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                    aria-label={
                      mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    className="rounded px-2 py-1 text-xs font-semibold text-[#008994] transition hover:bg-[#F4F8FA]"
                  >
                    {mostrarContrasena ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="flex h-11 w-full items-center justify-center rounded-lg bg-[#008994] text-sm font-semibold text-white shadow-sm transition hover:bg-[#00747E] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cargando ? "Validando acceso..." : "Iniciar sesión"}
              </button>

              {mensaje && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`rounded-lg p-3 text-center text-xs font-medium leading-5 ${
                    tipoMensaje === "error"
                      ? "bg-[#FDECEC] text-[#C53030]"
                      : "bg-[#E8F7F0] text-[#168052]"
                  }`}
                >
                  {mensaje}
                </p>
              )}
            </form>

            <div className="mt-6 border-t border-[#E8EEF1] pt-4 text-center">
              <Link
                href="/"
                className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-[#DCE6EA] bg-white text-xs font-semibold text-[#164652] transition hover:bg-[#F4F8FA]"
              >
                Continuar como usuario público
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
