
"use client";

import { useState } from "react";
import {
  Building2,
  Contact,
  UserRound,
  Phone,
  Mail,
  ShieldCheck,
  Pencil,
  Save,
  X,
} from "lucide-react";

interface Shelter {
  name: string;
  address: string;
  capacity: string;
  responsible: string;
  phone: string;
  email: string;
}

const initialShelter: Shelter = {
  name: "San José",
  address: "Carrera 8 # 24-35, Centro, Pereira",
  capacity: "180",
  responsible: "Laura Martínez",
  phone: "+57 310 555 0142",
  email: "sanjose@albergues.org.co",
};

export default function MiAlberguePage() {
  const [shelter, setShelter] = useState(initialShelter);
  const [form, setForm] = useState(initialShelter);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (field: keyof Shelter, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleEdit = () => {
    setForm(shelter);
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setForm(shelter);
    setError("");
    setIsEditing(false);
  };

  const handleSave = () => {
    if (
      !form.name.trim() ||
      !form.address.trim() ||
      !form.responsible.trim() ||
      !form.phone.trim() ||
      !form.email.trim() ||
      !form.capacity.trim()
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (!/^[1-9]\d*$/.test(form.capacity)) {
      setError("La capacidad debe ser un número entero mayor que cero.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    if (!/^\+?[0-9\s()-]{7,20}$/.test(form.phone)) {
      setError("Ingresa un número de teléfono válido.");
      return;
    }

    setShelter(form);
    setError("");
    setSuccess("La información del albergue se actualizó correctamente.");
    setIsEditing(false);
  };

  const renderField = (
    label: string,
    field: keyof Shelter,
    value: string,
    type = "text"
  ) => (
    <div>
      <label className="mb-1 block text-xs text-[#8297A1]">
        {label}
      </label>

      {isEditing ? (
        <input
          type={type}
          min={type === "number" ? "1" : undefined}
          step={type === "number" ? "1" : undefined}
          value={form[field]}
          onChange={(event) => handleChange(field, event.target.value)}
          className="w-full rounded-lg border border-[#DCE6EA] bg-white px-3 py-2 text-sm text-[#29434D] outline-none transition focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/10"
        />
      ) : (
        <p className="text-sm text-[#29434D]">{value}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-semibold text-[#203B45]">
          Mi Albergue
        </h1>
        <p className="mt-1 text-sm text-[#718895]">
          Consulta y actualización de la información del albergue
        </p>
      </div>

      {/* Albergue asignado */}
      <div className="flex flex-col justify-between gap-3 rounded-xl bg-[#E4F8F8] px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#009EAD]">
            <Building2 size={21} />
          </div>

          <div>
            <p className="text-xs font-medium text-[#009EAD]">
              Albergue asignado
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#29434D]">
              {shelter.name} · Pereira
            </p>
          </div>
        </div>

        <p className="text-xs font-medium text-[#009EAD] sm:text-right">
          Risaralda, Colombia
        </p>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
        {/* Información general */}
        <section className="rounded-xl border border-[#E4EBEF] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 border-b border-[#E8EEF1] pb-4">
            <Building2 size={17} className="text-[#009EAD]" />
            <h2 className="text-sm font-medium text-[#29434D]">
              Información general
            </h2>
          </div>

          <div className="space-y-5 pt-4">
            {renderField(
              "Nombre del albergue",
              "name",
              shelter.name
            )}

            <div>
              {renderField(
                "Dirección / ubicación",
                "address",
                shelter.address
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {renderField(
                "Capacidad máxima",
                "capacity",
                `${shelter.capacity} personas`,
                "number"
              )}

              <div>
                <label className="mb-1 block text-xs text-[#8297A1]">
                  Estado del albergue
                </label>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E9F7F0] px-2.5 py-1 text-xs font-medium text-[#23845A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#32A875]" />
                  Activo
                </span>
              </div>
            </div>

            <div className="border-t border-[#E8EEF1] pt-4">
              <label className="mb-1 block text-xs text-[#8297A1]">
                Fecha de registro
              </label>
              <p className="text-sm text-[#29434D]">
                12 de septiembre de 2026
              </p>
            </div>
          </div>
        </section>

        {/* Información de contacto */}
        <section className="rounded-xl border border-[#E4EBEF] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 border-b border-[#E8EEF1] pb-4">
            <Contact size={17} className="text-[#009EAD]" />
            <h2 className="text-sm font-medium text-[#29434D]">
              Información de contacto
            </h2>
          </div>

          <div className="space-y-5 pt-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#F3F8FA] p-2 text-[#6E8995]">
                <UserRound size={16} />
              </div>
              <div className="min-w-0 flex-1">
                {renderField(
                  "Responsable",
                  "responsible",
                  shelter.responsible
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#F3F8FA] p-2 text-[#6E8995]">
                <Phone size={16} />
              </div>
              <div className="min-w-0 flex-1">
                {renderField(
                  "Teléfono",
                  "phone",
                  shelter.phone,
                  "tel"
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#F3F8FA] p-2 text-[#6E8995]">
                <Mail size={16} />
              </div>
              <div className="min-w-0 flex-1">
                {renderField(
                  "Correo electrónico",
                  "email",
                  shelter.email,
                  "email"
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Avisos y acciones */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-[#8297A1]">
          <ShieldCheck size={15} className="shrink-0 text-[#6E8995]" />
          <p>
            Solo puedes gestionar la información de tu albergue asignado.
          </p>
        </div>

        {isEditing ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center justify-center gap-2 rounded-lg border border-[#DCE6EA] px-4 py-2.5 text-sm text-[#607985] hover:bg-white"
            >
              <X size={16} />
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#00B9C7] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#009EAD]"
            >
              <Save size={16} />
              Guardar cambios
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleEdit}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#00B9C7] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#009EAD]"
          >
            <Pencil size={15} />
            Editar información
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="text-sm text-[#23845A]">
          {success}
        </p>
      )}
    </div>
  );
}
