
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PoblacionPage from "./page";

describe("PoblacionPage", () => {
    beforeEach(() => {
        render(<PoblacionPage />);
    });

    it("debe mostrar el título y la descripción de la página", () => {
        expect(
            screen.getByRole("heading", { name: "Población del albergue" })
        ).toBeInTheDocument();

        expect(
            screen.getByText("Registra y actualiza la cantidad de personas alojadas")
        ).toBeInTheDocument();
    });

    it("debe mostrar los indicadores iniciales en cero", () => {
        expect(screen.getAllByText("180")).toHaveLength(2);
        expect(screen.getByText("0%")).toBeInTheDocument();
        expect(screen.getByText("Plazas libres para nuevos ingresos")).toBeInTheDocument();
        expect(screen.getByText("0 de 180 plazas ocupadas")).toBeInTheDocument();
    });

    it("debe mostrar el historial vacío inicialmente", () => {
        expect(screen.getByText("0 registros")).toBeInTheDocument();

        expect(
            screen.getByText("No hay registros de población")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Los registros que guardes aparecerán aquí.")
        ).toBeInTheDocument();
    });

    it("debe mostrar los campos del formulario", () => {
        expect(
            screen.getByLabelText("Cantidad de personas alojadas")
        ).toBeInTheDocument();

        expect(screen.getByLabelText("Fecha del registro")).toBeInTheDocument();

        expect(screen.getByLabelText("Hora del registro")).toBeInTheDocument();

        expect(screen.getByLabelText("Observaciones")).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /guardar registro/i })
        ).toBeInTheDocument();
    });

    it("debe validar que la cantidad de personas sea obligatoria", () => {
        fireEvent.click(
            screen.getByRole("button", { name: /guardar registro/i })
        );

        expect(
            screen.getByText("Ingresa una cantidad válida de personas.")
        ).toBeInTheDocument();

        expect(screen.getByText("0 registros")).toBeInTheDocument();
    });

    it("no debe permitir cantidades negativas", () => {
        fireEvent.change(
            screen.getByLabelText("Cantidad de personas alojadas"),
            { target: { value: "-5" } }
        );

        fireEvent.click(
            screen.getByRole("button", { name: /guardar registro/i })
        );

        expect(
            screen.getByText("La cantidad de personas no puede ser negativa.")
        ).toBeInTheDocument();
    });

    it("no debe permitir superar la capacidad máxima", () => {
        fireEvent.change(
            screen.getByLabelText("Cantidad de personas alojadas"),
            { target: { value: "200" } }
        );

        fireEvent.click(
            screen.getByRole("button", { name: /guardar registro/i })
        );

        expect(
            screen.getByText(
                "La cantidad no puede superar la capacidad máxima de 180 personas."
            )
        ).toBeInTheDocument();
    });

    it("debe guardar un registro correctamente", () => {
        fireEvent.change(
            screen.getByLabelText("Cantidad de personas alojadas"),
            { target: { value: "120" } }
        );

        fireEvent.change(screen.getByLabelText("Observaciones"), {
            target: { value: "Registro de prueba." },
        });

        fireEvent.click(
            screen.getByRole("button", { name: /guardar registro/i })
        );

        expect(
            screen.getByText("El registro de población se guardó correctamente.")
        ).toBeInTheDocument();

        expect(screen.getByText("1 registros")).toBeInTheDocument();
        expect(screen.getAllByText("120").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("60")).toBeInTheDocument();
        expect(screen.getAllByText("67%").length).toBeGreaterThanOrEqual(1);
        expect(
            screen.getAllByText("Registro de prueba.").length
        ).toBeGreaterThanOrEqual(1);
    });

    it("debe agregar nuevos registros sin eliminar los anteriores", () => {
        const peopleInput = screen.getByLabelText(
            "Cantidad de personas alojadas"
        );

        fireEvent.change(peopleInput, { target: { value: "100" } });

        fireEvent.click(
            screen.getByRole("button", { name: /guardar registro/i })
        );

        fireEvent.change(peopleInput, { target: { value: "120" } });

        fireEvent.click(
            screen.getByRole("button", { name: /guardar registro/i })
        );

        expect(screen.getByText("2 registros")).toBeInTheDocument();
        expect(screen.getAllByText("100").length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText("120").length).toBeGreaterThanOrEqual(1);
    });

    it("debe mostrar una advertencia cuando la ocupación llega al 80%", () => {
        fireEvent.change(
            screen.getByLabelText("Cantidad de personas alojadas"),
            { target: { value: "150" } }
        );

        fireEvent.click(
            screen.getByRole("button", { name: /guardar registro/i })
        );

        expect(
            screen.getByText(
                "Advertencia: el albergue se encuentra próximo a su capacidad máxima"
            )
        ).toBeInTheDocument();
    });

    it("debe cancelar y limpiar el formulario", () => {
        const peopleInput = screen.getByLabelText(
            "Cantidad de personas alojadas"
        ) as HTMLInputElement;

        fireEvent.change(peopleInput, { target: { value: "120" } });

        fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

        expect(peopleInput.value).toBe("");
        expect(screen.getByText("0 registros")).toBeInTheDocument();
    });
});
