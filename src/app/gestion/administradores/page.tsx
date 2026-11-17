import type { Metadata } from "next";
import { GestionAdministradoresPage } from "@/layers/presentation/pages/gestion-administradores-page";

export const metadata: Metadata = {
  title: "Administradores · Semáforo Vital",
};

export default function Page() {
  return <GestionAdministradoresPage />;
}
