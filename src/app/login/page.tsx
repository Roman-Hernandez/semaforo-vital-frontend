
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { SyntheticEvent } from "react";

export default function LoginPage() {
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [cargando, setCargando] = useState(false);
    const [tipoMensaje, setTipoMensaje] = useState<
        "exito" | "error" | "info" | ""
    >("");


    async function handleSubmit(
        event: SyntheticEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (cargando) return;

        setCargando(true);
        setMensaje("Validando acceso...");
        setTipoMensaje("info");

        try {
            // Simulación temporal de la respuesta del servidor.
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setMensaje(
                "No fue posible iniciar sesión. Verifica tus credenciales e inténtalo nuevamente."
            );
            setTipoMensaje("error");
        } finally {
            setCargando(false);
        }
    }


    return (
        <main className="flex min-h-screen items-center justify-center bg-[#DDFBFA] p-3 sm:p-6 lg:p-10">
            <section className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-2xl shadow-[#005F67]/20 min-[761px]:grid-cols-2">

                {/* PANEL IZQUIERDO: IMAGEN */}
                <div className="relative min-h-[340px] overflow-hidden bg-[#DDFBFA] max-[760px]:hidden md:min-h-[570px]">
                    <Image
                        src="/loginImagen.png"
                        alt="Ilustración de Semáforo Vital y albergues"
                        fill
                        priority
                        sizes="(max-width: 767px) 150vw, 50vw"
                        className="object-cover object-center"
                    />
                </div>

                {/* PANEL DERECHO: FORMULARIO */}
                <div className="flex items-center justify-center px-6 py-8 sm:px-10 md:px-8 lg:px-12">
                    <div className="w-full max-w-sm">

                        {/* LOGO Y ENCABEZADO */}

                        <div className="mb-7 text-center">
                            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center">
                                <Image
                                    src="/icono.png"
                                    alt="Logo de Semáforo Vital"
                                    width={80}
                                    height={80}
                                    priority
                                    className="h-20 w-20 object-contain"
                                />
                            </div>
                        </div>


                        {/* AVISO DE ACCESO */}
                        <div className="mb-5 flex items-center gap-2.5 rounded-lg bg-[#E6F9FA] p-3 text-[#168D9D]">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                >
                                    <rect x="5" y="10" width="14" height="11" rx="2" />
                                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                                    <circle cx="12" cy="15" r="1" />
                                </svg>
                            </span>

                            <p className="text-[13px] leading-4">
                                Acceso reservado para Administradores de albergue y Súper administradores.
                            </p>
                        </div>

                        {/* FORMULARIO */}
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* CORREO */}
                            <div>
                                <label
                                    htmlFor="correo"
                                    className="mb-1.5 block text-s font-semibold text-[#29444D]"
                                >
                                    Correo electrónico
                                </label>

                                <div className="flex h-11 items-center gap-3 rounded-lg border border-[#D9E5E9] px-3 text-[#84969D] transition focus-within:border-[#08BFC9] focus-within:ring-2 focus-within:ring-[#08BFC9]/15">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="h-4 w-4 shrink-0"
                                        aria-hidden="true"
                                    >
                                        <rect x="3" y="5" width="18" height="14" rx="2" />
                                        <path d="m4 7 8 6 8-6" />
                                    </svg>

                                    <input
                                        id="correo"
                                        name="correo"
                                        type="email"
                                        autoComplete="username"
                                        placeholder="nombre@institucion.gob"
                                        value={correo}
                                        onChange={(event) => {
                                            setCorreo(event.target.value);
                                            setMensaje("");
                                            setTipoMensaje("");
                                        }}
                                        required
                                        className="h-full min-w-0 flex-1 bg-transparent text-xs text-[#29444D] outline-none placeholder:text-[#98A8AE]"
                                    />
                                </div>
                            </div>

                            {/* CONTRASEÑA */}
                            <div>
                                <label
                                    htmlFor="contrasena"
                                    className="mb-1.5 block text-s font-semibold text-[#29444D]"
                                >
                                    Contraseña
                                </label>

                                <div className="flex h-11 items-center gap-3 rounded-lg border border-[#D9E5E9] px-3 text-[#84969D] transition focus-within:border-[#08BFC9] focus-within:ring-2 focus-within:ring-[#08BFC9]/15">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="h-4 w-4 shrink-0"
                                        aria-hidden="true"
                                    >
                                        <circle cx="8" cy="15" r="4" />
                                        <path d="m11 12 7-7 3 3-2 2-2-1-2 2-2-1-2 2" />
                                    </svg>

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
                                        className="h-full min-w-0 flex-1 bg-transparent text-xs text-[#29444D] outline-none placeholder:text-[#98A8AE]"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMostrarContrasena(!mostrarContrasena)
                                        }
                                        aria-label={
                                            mostrarContrasena
                                                ? "Ocultar contraseña"
                                                : "Mostrar contraseña"
                                        }
                                        className="rounded p-1 transition hover:text-[#079EAC]"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        >
                                            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                                            <circle cx="12" cy="12" r="2.5" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="mt-2 text-right">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMensaje(
                                                "La recuperación de contraseña se habilitará próximamente."
                                            )
                                        }
                                        className="text-[14px] font-semibold text-[#079EAC] hover:underline"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>
                            </div>

                            {/* BOTÓN INGRESAR */}
                            <button
                                type="submit"
                                disabled={cargando}
                                className="flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-[#08C0CA] text-sm font-semibold text-[#16464E] shadow-sm transition hover:bg-[#05AEB9] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {cargando ? "Validando acceso..." : "Iniciar sesión"}
                                {!cargando && <span aria-hidden="true">→</span>}
                            </button>


                            {mensaje && (
                                <p
                                    role="status"
                                    aria-live="polite"
                                    className={`rounded-lg p-3 text-center text-sm leading-5 ${tipoMensaje === "error"
                                        ? "bg-red-50 text-red-700"
                                        : "bg-[#E6F9FA] text-[#087F8C]"
                                        }`}
                                >
                                    {mensaje}
                                </p>
                            )}

                        </form>

                        {/* SEPARADOR */}
                        <div className="my-4 flex items-center gap-3">
                            <div className="h-px flex-1 bg-[#E5ECEF]" />
                            <span className="text-[10px] text-[#94A5AB]">o</span>
                            <div className="h-px flex-1 bg-[#E5ECEF]" />
                        </div>

                        {/* ACCESO PÚBLICO */}
                        <Link
                            href="/"
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#D1E0E5] bg-white text-s font-semibold text-[#168F9E] transition hover:bg-[#F1FBFB]"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                className="h-4 w-4"
                                aria-hidden="true"
                            >
                                <circle cx="12" cy="12" r="9" />
                                <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
                            </svg>

                            Continuar como usuario público
                        </Link>

                        <p className="mt-3 text-center text-[12px] text-[#94A5AB]">
                            Accede a la página pública sin iniciar sesión
                        </p>

                    </div>
                </div>
            </section>
        </main>
    );
}
