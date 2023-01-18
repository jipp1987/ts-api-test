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
     * Acción click botón página siguiente.
     */
    nextPageAction(): void;
    /**
     * Acción click botón página anterior.
     */
    previousPageAction(): void;
    /**
     * Acción click botón primera página.
     */
    firstPageAction(): void;
    /**
     * Acción click botón última página.
     */
    lastPageAction(): void;
    /**
     * Acción de cambio de página.
     * 
     * @param param 
     */
    pageChangeAction(param: number): void;
    /**
     * Número de páginas.
     */
    pageNumber: number;
}

/**
 * Paginador para tablas lazy: la consulta se hace paginada directamente sobre la base de datos.
 * 
 * @param props 
 * @returns Componente React. 
 */
export function LazyPaginator(props: IPaginatorProps) {
    const [pageNumber, setPageNumber] = useState<number>(props.pageNumber);

    // Si cambian los valores, debe repintarse el componente
    useEffect(() => {
        setPageNumber(props.pageNumber);
    }, [props.pageNumber]);

    // Valores para el combobox
    const combo_values: Array<ComboBoxValue> = [];
    for (let i = 1; i <= pageNumber; i++) {
        combo_values[i - 1] = new ComboBoxValue(i, i);
    }

    return (
        <div className="paginator-wrapping">

            <ImageButton className="first-button" onClick={() => props.firstPageAction()} />

            <ImageButton className="previous-button" onClick={() => props.previousPageAction()} />

            <ComboBox values={combo_values} onChangeAction={props.pageChangeAction} />
            
            <ImageButton className="next-button" onClick={() => props.nextPageAction()} />
            
            <ImageButton className="last-button" onClick={() => props.lastPageAction()} />

        </div>
    );

}