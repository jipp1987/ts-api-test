import { useState, useEffect } from 'react';

import { ComboBoxValue, generateUuid } from "../utils/helper-utils";
import ImageButton from "./image-button";
import ComboBox from "./combobox";
import Tooltip from './tooltip';
import { FormattedMessage } from 'react-intl';

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
    /**
     * Número de filas a mostrar por página.
     */
    rowNumberPerPage: number;
    /**
     * Acción de modificación de número de filas.
     * 
     * @param rowNumber 
     */
    changeRowNumberAction(rowNumber: number): void;
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
    const [rowNumberPerPage, setRowNumberPerPage] = useState<number>(props.rowNumberPerPage);
    const [id] = useState<string>(generateUuid());

    // Si cambian los valores, debe repintarse el componente
    useEffect(() => {
        setPagesNumber(props.pagesNumber);
    }, [props.pagesNumber]);

    useEffect(() => {
        setSelectedPage(props.currentPage);
    }, [props.currentPage]);

    useEffect(() => {
        setRowNumberPerPage(props.rowNumberPerPage);
    }, [props.rowNumberPerPage]);

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

    /**
     * Acción de cambio de número de filas por página.
     * @param e 
     */
    const changeRowNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Validar que han introducido un número entero.
        if (!/[0-9]/.test(event.target.value)) {
            event.preventDefault();
        } else {
            const newValue: string = event.target.value;
            setRowNumberPerPage(parseInt(newValue));
        }
    }

    /**
     * Acción de pérdida de foco sobre el input de rowNumber.
     * 
     * @param event 
     */
    const onBlurRowNumber = (event: React.FocusEvent<HTMLInputElement>) => {
        const newValue: number = rowNumberPerPage;

        if (newValue !== null && newValue !== undefined) {
            props.changeRowNumberAction(newValue);
        }
    }

    const defaultValue: ComboBoxValue = new ComboBoxValue(selectedPage, selectedPage);

    return (
        <div id={id} className="paginator-wrapping">

            <ImageButton id={id + "_first_button"} className="first-button" onClick={() => changePage("first")} />

            <ImageButton id={id + "_prev_button"} className="previous-button" onClick={() => changePage("previous")} />

            <ComboBox id={id + "_select_page"} values={combo_values} defaultValue={defaultValue}
                onChangeAction={(newPage: number) => { props.pageChangeAction(newPage); }} />

            <ImageButton id={id + "_next_button"} className="next-button" onClick={() => changePage("next")} />

            <ImageButton id={id + "_last_button"} className="last-button" onClick={() => changePage("last")} />

            <Tooltip direction='right' 
                content={<FormattedMessage id="i18n_change_row_number" defaultMessage="Change row number per page" />}>
                <input id={id + "_change_row_limit"} type="text" value={rowNumberPerPage}
                    onChange={(e) => changeRowNumber(e)} onBlur={(e) => onBlurRowNumber(e)} 
                    inputMode="numeric" className='my-input' maxLength={2} size={2} />
            </Tooltip>

        </div>
    );

}