import { useState, useEffect } from 'react';

import { ComboBoxValue } from "../utils/helper-utils";
import ImageButton from "./image-button";
import ComboBox from "./combobox";

import "./styles/paginator.css";

/**
 * Propiedades del componente.
 */
interface IPaginatorProps {
    /**
     * Acción de cambio de página.
     * 
     * @param param 
     */
    pageChangeAction(param: number): void;
    /**
     * Número de páginas.
     */
    pagesNumber: number;
    /**
     * Página actual pasada desde el controlador.
     */
    currentPage: number;
}

/**
 * Paginador para tablas lazy: la consulta se hace paginada directamente sobre la base de datos.
 * 
 * @param props 
 * @returns Componente React. 
 */
export function LazyPaginator(props: IPaginatorProps) {
    const [pagesNumber, setPagesNumber] = useState<number>(props.pagesNumber);
    const [selectedPage, setSelectedPage] = useState<number>(props.currentPage);

    // Si cambian los valores, debe repintarse el componente
    useEffect(() => {
        setPagesNumber(props.pagesNumber);
    }, [props.pagesNumber]);

    useEffect(() => {
        setSelectedPage(props.currentPage);
    }, [props.currentPage]);

    // Valores para el combobox
    const combo_values: Array<ComboBoxValue> = [];
    for (let i = 1; i <= pagesNumber; i++) {
        combo_values[i - 1] = new ComboBoxValue(i, i);
    }

    /**
     * Acción de cambio de página según los botones.
     * 
     * @param option 
     */
    const changePage = (option: "first" | "previous" | "next" | "last") => {
        // Cambiar el valor del estado
        let newPage: number;
        switch (option) {
            case "first":
                newPage = 1;
                break;
            case "previous":
                // Esto es curioso: a pesar de estar tipado como número, puede ser que venga como string
                // Por si acaso lo parseo, sino va a intentar ir a una página incorrecta o que directamente no existe
                newPage = selectedPage > 1 ? parseInt(selectedPage.toString()) - 1 : 1;
                break;
            case "next":
                newPage = selectedPage < pagesNumber ? parseInt(selectedPage.toString()) + 1 : pagesNumber;
                break;
            case "last":
            default:
                newPage = pagesNumber;
                break;
        }

        // Lo almaceno en el estado para la siguiente acción de cambio.
        setSelectedPage(newPage);

        // Llamar a la función de cambio de página del elemento padre. OJO!!! NO puedo usar selectedPage porque al ser un atributo
        // de estado no se settea en el momento en el que se lo dices, lo hace en otra fase. Por eso utilizo mejor la variable con la que
        // he calculado la nueva página.
        props.pageChangeAction(newPage);
    }

    const defaultValue: ComboBoxValue = new ComboBoxValue(selectedPage, selectedPage);

    return (
        <div className="paginator-wrapping">

            <ImageButton className="first-button" onClick={() => changePage("first")} />

            <ImageButton className="previous-button" onClick={() => changePage("previous")} />

            <ComboBox values={combo_values} defaultValue={defaultValue} 
                onChangeAction={(newPage: number) => { props.pageChangeAction(newPage); }} />

            <ImageButton className="next-button" onClick={() => changePage("next")} />

            <ImageButton className="last-button" onClick={() => changePage("last")} />

        </div>
    );

}