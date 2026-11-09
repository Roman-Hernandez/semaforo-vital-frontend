import type { Metadata } from "next";
import { GestionAlberguesPage } from "@/layers/presentation/pages/gestion-albergues-page";

export const metadata: Metadata = {
  title: "Gestión de albergues · Semáforo Vital",
};

export default function Page() {
  return <GestionAlberguesPage />;
}
