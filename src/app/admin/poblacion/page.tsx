
"use client";

import { useState } from "react";
import {
    Users,
    Building2,
    Bed,
    PieChart,
    AlertTriangle,
    Save,
    CalendarDays,
    Info,
} from "lucide-react";

interface PopulationRecord {
    id: number;
    date: string;
    time: string;
    people: number;
    occupancy: number;
    observations: string;
}

const CAPACITY = 180;

const initialHistory: PopulationRecord[] = [];

const formatDate = (date: string, time: string) => {
    const [year, month, day] = date.split("-");
    return `${day} ${new Intl.DateTimeFormat("es-CO", {
        month: "short",
    }).format(new Date(Number(year), Number(month) - 1, Number(day)))} ${year} · ${time}`;
};

export default function PoblacionPage() {
    const [history, setHistory] = useState(initialHistory);
    const [people, setPeople] = useState("");
    const [date, setDate] = useState("2026-11-10");
    const [time, setTime] = useState("14:00");
    const [observations, setObservations] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const currentPeople = history[0]?.people ?? 0;
    const available = CAPACITY - currentPeople;
    const occupancy = Math.round((currentPeople / CAPACITY) * 100);

    const handleSave = () => {
        const quantity = Number(people);

        if (people.trim() === "" || !Number.isInteger(quantity)) {
            setError("Ingresa una cantidad válida de personas.");
            setSuccess("");
            return;
        }

        if (quantity < 0) {
            setError("La cantidad de personas no puede ser negativa.");
            setSuccess("");
            return;
        }

        if (quantity > CAPACITY) {
            setError(
                `La cantidad no puede superar la capacidad máxima de ${CAPACITY} personas.`
            );
            setSuccess("");
            return;
        }

        if (!date || !time) {
            setError("La fecha y la hora del registro son obligatorias.");
            setSuccess("");
            return;
        }

        const newRecord: PopulationRecord = {
            id: Date.now(),
            date,
            time,
            people: quantity,
            occupancy: Math.round((quantity / CAPACITY) * 100),
            observations: observations.trim() || "Sin observaciones.",
        };

        setHistory((previous) =>
            [newRecord, ...previous].sort((a, b) => {
                return (
                    new Date(`${b.date}T${b.time}`).getTime() -
                    new Date(`${a.date}T${a.time}`).getTime()
                );
            })
        );

        setError("");
        setSuccess("El registro de población se guardó correctamente.");
        setObservations("");
    };

    const handleCancel = () => {
        setPeople("");
        setObservations("");
        setError("");
        setSuccess("");
    };

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div>
                <h1 className="text-2xl font-semibold text-[#203B45]">
                    Población del albergue
                </h1>
                <p className="mt-1 text-sm text-[#718895]">
                    Registra y actualiza la cantidad de personas alojadas
                </p>
            </div>

            {/* Indicadores */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {/* Personas alojadas */}
                <section className="rounded-xl border border-[#E4EBEF] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#29434D]">
                            Personas alojadas
                        </p>
                        <div className="rounded-lg bg-[#E4F8F8] p-2 text-[#009EAD]">
                            <Users size={19} />
                        </div>
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-[#203B45]">
                        {currentPeople}
                    </p>
                    <p className="mt-2 text-xs text-[#8297A1]">
                        Personas registradas actualmente
                    </p>
                </section>

                {/* Capacidad máxima */}
                <section className="rounded-xl border border-[#E4EBEF] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#29434D]">
                            Capacidad máxima
                        </p>
                        <div className="rounded-lg bg-[#E4F8F8] p-2 text-[#009EAD]">
                            <Building2 size={19} />
                        </div>
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-[#203B45]">
                        {CAPACITY}
                    </p>
                    <p className="mt-2 text-xs text-[#8297A1]">
                        Personas que puede alojar el albergue
                    </p>
                </section>

                {/* Cupos disponibles */}
                <section className="rounded-xl border border-[#E4EBEF] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#29434D]">
                            Cupos disponibles
                        </p>
                        <div className="rounded-lg bg-[#E4F8F8] p-2 text-[#009EAD]">
                            <Bed size={19} />
                        </div>
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-[#203B45]">
                        {available}
                    </p>
                    <p className="mt-2 text-xs text-[#8297A1]">
                        Plazas libres para nuevos ingresos
                    </p>
                </section>

                {/* Ocupación */}
                <section className="rounded-xl border border-[#E4EBEF] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#29434D]">
                            Ocupación
                        </p>
                        <div className="rounded-lg bg-[#E4F8F8] p-2 text-[#009EAD]">
                            <PieChart size={19} />
                        </div>
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-[#203B45]">
                        {occupancy}%
                    </p>
                    <p className="mt-2 text-xs text-[#8297A1]">
                        {currentPeople} de {CAPACITY} plazas ocupadas
                    </p>
                    <progress
                        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#E8EEF1] [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-[#00B9C7] [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-[#00B9C7]"
                        aria-label="Porcentaje de ocupación"
                        value={occupancy}
                        max={100}
                    />
                </section>
            </div>

            {/* Advertencia de capacidad */}
            {occupancy >= 80 && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-lg border border-[#F8D98A] bg-[#FFF7E3] px-4 py-3"
                >
                    <AlertTriangle
                        size={19}
                        className="mt-0.5 shrink-0 text-[#A66A00]"
                    />
                    <div>
                        <p className="text-sm font-medium text-[#956000]">
                            Advertencia: el albergue se encuentra próximo a su capacidad máxima
                        </p>
                        <p className="mt-1 text-xs text-[#A67B32]">
                            Quedan {available} cupos disponibles. Verifica la disponibilidad
                            antes de registrar nuevos ingresos.
                        </p>
                    </div>
                </div>
            )}

            {/* Formulario */}
            <section className="rounded-xl border border-[#E4EBEF] bg-white p-5 shadow-sm sm:p-6">
                <div className="border-b border-[#E8EEF1] pb-4">
                    <h2 className="text-base font-medium text-[#29434D]">
                        Actualizar población
                    </h2>
                    <p className="mt-1 text-sm text-[#8297A1]">
                        Registra el total actual de personas en el Albergue San José.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 pt-5 sm:grid-cols-2">
                    {/* Cantidad de personas */}
                    <div>
                        <label
                            htmlFor="people"
                            className="mb-2 block text-sm font-medium text-[#29434D]"
                        >
                            Cantidad de personas alojadas
                        </label>
                        <div className="relative">
                            <input
                                id="people"
                                type="number"
                                min="0"
                                max={CAPACITY}
                                step="1"
                                value={people}
                                onChange={(event) => {
                                    setPeople(event.target.value);
                                    setError("");
                                    setSuccess("");
                                }}
                                className="w-full rounded-lg border border-[#DCE6EA] bg-white px-3 py-2.5 pr-10 text-sm text-[#29434D] outline-none transition focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
                            />
                            <Users
                                size={16}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8297A1]"
                            />
                        </div>
                        <p className="mt-2 text-xs text-[#8297A1]">
                            Capacidad máxima: {CAPACITY} personas
                        </p>
                    </div>

                    {/* Fecha */}
                    <div>
                        <label
                            htmlFor="date"
                            className="mb-2 block text-sm font-medium text-[#29434D]"
                        >
                            Fecha del registro
                        </label>
                        <div className="relative">
                            <input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(event) => {
                                    setDate(event.target.value);
                                    setError("");
                                    setSuccess("");
                                }}
                                className="w-full rounded-lg border border-[#DCE6EA] bg-white px-3 py-2.5 text-sm text-[#29434D] outline-none transition focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
                            />
                        </div>
                    </div>

                    {/* Hora */}
                    <div>
                        <label
                            htmlFor="time"
                            className="mb-2 block text-sm font-medium text-[#29434D]"
                        >
                            Hora del registro
                        </label>
                        <div className="relative">
                            <input
                                id="time"
                                type="time"
                                value={time}
                                onChange={(event) => {
                                    setTime(event.target.value);
                                    setError("");
                                    setSuccess("");
                                }}
                                className="w-full rounded-lg border border-[#DCE6EA] bg-white px-3 py-2.5 text-sm text-[#29434D] outline-none transition focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
                            />
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div className="sm:col-span-2">
                        <label
                            htmlFor="observations"
                            className="mb-2 block text-sm font-medium text-[#29434D]"
                        >
                            Observaciones
                        </label>
                        <textarea
                            id="observations"
                            rows={3}
                            value={observations}
                            onChange={(event) => {
                                setObservations(event.target.value);
                                setSuccess("");
                            }}
                            placeholder="Escribe alguna observación sobre el registro..."
                            className="w-full resize-none rounded-lg border border-[#DCE6EA] bg-white px-3 py-3 text-sm text-[#29434D] outline-none transition placeholder:text-[#A0B0B8] focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
                        />
                    </div>
                </div>

                {/* Mensajes */}
                {error && (
                    <p role="alert" className="mt-4 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {success && (
                    <output className="text-sm text-[#23845A]">
                        {success}
                    </output>
                    )}

                {/* Botones */}
                <div className="mt-5 flex flex-wrap gap-2 border-t border-[#E8EEF1] pt-4">
                    <button
                        type="button"
                        onClick={handleSave}
                        className="flex items-center justify-center gap-2 rounded-lg bg-[#00B9C7] px-4 py-2.5 text-sm font-medium text-black transition hover:bg-[#009EAD]"
                    >
                        <Save size={15} />
                        Guardar registro
                    </button>

                    <button
                        type="button"
                        onClick={handleCancel}
                        className="flex items-center justify-center gap-2 rounded-lg border border-[#DCE6EA] px-4 py-2.5 text-sm transition hover:bg-[#F5F9FA]"
                    >

                        Cancelar
                    </button>
                </div>
            </section>

            {/* Historial */}
            <section className="overflow-hidden rounded-xl border border-[#E4EBEF] bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-2 border-b border-[#E8EEF1] p-5 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-base font-medium text-[#29434D]">
                            Historial de población
                        </h2>
                        <p className="mt-1 text-sm text-[#8297A1]">
                            Consulta los registros y actualiza el que necesite una corrección.
                        </p>
                    </div>

                    <span className="w-fit rounded-full bg-[#F3F7F9] px-3 py-1 text-xs text-[#718895]">
                        {history.length} registros
                    </span>
                </div>

                {history.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                        <CalendarDays
                            size={28}
                            className="mx-auto mb-3 text-[#A0B0B8]"
                        />
                        <p className="text-sm font-medium text-[#29434D]">
                            No hay registros de población
                        </p>
                        <p className="mt-1 text-xs text-[#8297A1]">
                            Los registros que guardes aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Tabla para escritorio */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full min-w-[700px] text-left">
                                <thead className="bg-[#F6F9FA]">
                                    <tr className="text-xs text-[#718895]">
                                        <th className="px-5 py-3 font-medium">
                                            Fecha y hora
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Cantidad de personas
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Porcentaje de ocupación
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Observaciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {history.map((record, index) => (
                                        <tr
                                            key={record.id}
                                            className={`border-t border-[#E8EEF1] ${index === 0 ? "bg-[#F1FBFB]" : ""
                                                }`}
                                        >
                                            <td className="px-5 py-3">
                                                <p className="text-sm text-[#29434D]">
                                                    {formatDate(record.date, record.time)}
                                                </p>
                                                {index === 0 && (
                                                    <span className="text-xs font-medium text-[#009EAD]">
                                                        Registro más reciente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-sm font-medium text-[#29434D]">
                                                {record.people}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${record.occupancy >= 80
                                                            ? "bg-[#FFF4D6] text-[#9B6A00]"
                                                            : "bg-[#F3F7F9] text-[#29434D]"
                                                        }`}
                                                >
                                                    {record.occupancy}%
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-[#718895]">
                                                {record.observations}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Tarjetas para móvil */}
                        <div className="divide-y divide-[#E8EEF1] md:hidden">
                            {history.map((record, index) => (
                                <div
                                    key={record.id}
                                    className={`space-y-3 p-4 ${index === 0 ? "bg-[#F1FBFB]" : ""
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-medium text-[#29434D]">
                                            {formatDate(record.date, record.time)}
                                        </p>
                                        <span className="rounded-full bg-[#F3F7F9] px-2.5 py-1 text-xs text-[#29434D]">
                                            {record.occupancy}%
                                        </span>
                                    </div>
                                    {index === 0 && (
                                        <p className="text-xs font-medium text-[#009EAD]">
                                            Registro más reciente
                                        </p>
                                    )}
                                    <p className="text-sm text-[#29434D]">
                                        <span className="text-[#8297A1]">
                                            Cantidad de personas:{" "}
                                        </span>
                                        <strong>{record.people}</strong>
                                    </p>
                                    <p className="text-xs text-[#718895]">
                                        {record.observations}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div className="flex flex-col justify-between gap-2 border-t border-[#E8EEF1] px-5 py-3 text-xs text-[#8297A1] sm:flex-row">
                    <span>
                        Mostrando {history.length} de {history.length} registros
                    </span>
                    <span>Del más reciente al más antiguo</span>
                </div>
            </section>

            {/* Nota informativa */}
            <div className="flex items-start gap-2 text-xs text-[#8297A1]">
                <Info size={15} className="mt-0.5 shrink-0" />
                <p>
                    Datos demostrativos. Este escenario ilustrativo no constituye una
                    evaluación sanitaria real.
                </p>
            </div>
        </div>
    );
}
