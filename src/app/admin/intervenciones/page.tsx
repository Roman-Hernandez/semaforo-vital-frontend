import type { Metadata } from "next";
import { IntervencionesPage } from "@/layers/presentation/pages/intervenciones-page";

export const metadata: Metadata = {
  title: "Intervenciones · Semáforo Vital",
};

export default function Page() {
  return <IntervencionesPage />;
}
