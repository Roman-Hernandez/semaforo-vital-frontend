import type { Metadata } from "next";
import { AnalisisRegresionPage } from "@/layers/presentation/pages/analisis-regresion-page";

export const metadata: Metadata = {
  title: "Análisis IA · Semáforo Vital",
};

export default function Page() {
  return <AnalisisRegresionPage />;
}
