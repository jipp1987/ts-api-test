import React, { useState, useEffect, useRef } from 'react';
import { generateUuid } from '../utils/helper-utils';
import { FormattedMessage } from "react-intl";
import ImageButton from './image-button';

import './styles/inputs.css';

/**
 * Clase CSS para línea seleccionada del suggestionBox.
 */
const SELECTED_CLASS = "suggestion-box-selected-row";

/**
 * Sufijo del id de la tabla de selección.
 */
const SELECTED_TABLE_ID_SUFIX = "_suggestionTable";

/**
 * Fabrica una tabla html para mostrar el listado de sugerencias a partir de una lista de objetos genéricos.
 * 
 * @param {string} parentId Id del componente padre.
 * @param {list} result Lista de objetos genéricos.
 * @param {function} selectAction Acción de selección.
 * @param {string} idFieldName Nombre del campo id para descartar de las columnas mostradas.
 * @returns {table} Devuelve una tabla html. 
 */
function makeTableForSuggestionBox(parentId: string, result: Array<any>, selectAction: Function, idFieldName: string) {
    const printColumns = (obj: { [key: string]: any }) => {
        return Object.keys(obj).map(function (key: string) {
            return key !== idFieldName ? <td key={generateUuid()}>{obj[key]}</td> : null;
        })
    };

    const printRows = (list: Array<any>) => {
        return list.map((obj) => {
            const id = generateUuid();
            return <tr key={id} id={id} onClick={() => selectAction(obj)} onMouseEnter={() => forceOnHover(id, parentId)}>{printColumns(obj)}</tr>
        })
    };

    return (
        <table id={parentId + SELECTED_TABLE_ID_SUFIX} className="suggestion-box">
            <tbody>
                {printRows(result)}
            </tbody>
        </table>
    );
}

/**
 * Devuelve las un array de dos posiciones: primero la el componente de tabla asociado al input, y segundo sus filas.
 * 
 * @param {string} parentId Id del componente padre.
 * @returns Si no encuentra la tabla de sugerencias o sus filas, devuelve null.
 */
function find_suggestion_box_with_its_rows(parentId: string) {
    // Buscar tabla de sugerencias con sus filas
    var suggestion_table = document.getElementById(parentId + SELECTED_TABLE_ID_SUFIX);

    if (suggestion_table === undefined || suggestion_table === null) {
        return null;
    }

    var rows = null;

    if (suggestion_table !== null) {
        rows = suggestion_table.querySelectorAll("tr");
    }

    // Comprobar que haya filas que seleccionar
    if (rows === undefined || rows === null || rows.length <= 0) {
        return null;
    }

    return { suggestion_table: suggestion_table, rows: rows };
}

/**
 * Forzar onHover de líneas del suggestionBox.
 * 
 * @param {*} id Identificador de la línea actual. 
 * @param {*} parentId Padre.
 */
function forceOnHover(id: string, parentId: string) {
    // Buscar tabla de sugerencias con sus filas
    const suggestion_box_with_rows = find_suggestion_box_with_its_rows(parentId);

    if (suggestion_box_with_rows === null) {
        return;
    }

    const suggestion_table = suggestion_box_with_rows.suggestion_table;
    const rows = suggestion_box_with_rows.rows;

    // Comprobar que haya filas que seleccionar
    if (rows !== undefined && rows !== null && rows.length > 0) {
        // Quitar clase de selección a fila seleccionada previamente
        const selected_row = suggestion_table.querySelectorAll("tr." + SELECTED_CLASS);
        if (selected_row !== undefined && selected_row !== null && selected_row.length > 0) {
            selected_row[0].classList.remove(SELECTED_CLASS);
        }

        // Seleccionar fila actual
        const element_: HTMLElement | null = document.getElementById(id);
        if (element_ !== null) {
            element_.classList.add(SELECTED_CLASS);
        }
    }

}

/**
 * Comprobar las teclas de cursos para navegar entre filas.
 * 
 * @param {*} e 
 */
function checkKey(e: React.KeyboardEvent, parentId: string): any {
    e = e || window.event;

    // Buscar tabla de sugerencias con sus filas
    const suggestion_box_with_rows = find_suggestion_box_with_its_rows(parentId);

    if (suggestion_box_with_rows === null) {
        return;
    }

    // const suggestion_table = suggestion_box_with_rows[0];
    const rows = suggestion_box_with_rows.rows;

    const start = rows[0];
    const end = rows[rows.length - 1];

    // Buscar la fila seleccionada y quitarle la clase css de selección
    var index = null;
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].getAttribute('class') === SELECTED_CLASS) {
            rows[i].classList.remove(SELECTED_CLASS);
            index = i;
            break;
        }
    }

    // up arrow
    if (e.key === "ArrowUp") {
        // Si no hay fila seleccionada, seleccionar la última
        if (index === null) {
            end.classList.add(SELECTED_CLASS);
        } else {
            // Comprobar que no me salgo de la lista de filas
            if (index > 0) {
                rows[index - 1].classList.add(SELECTED_CLASS);
            } else {
                end.classList.add(SELECTED_CLASS);
            }
        }
    } else if (e.key === "ArrowDown") {
        // down arrow
        // Si no hay fila seleccionada, seleccionar la primera
        if (index === null) {
            start.classList.add(SELECTED_CLASS);
        } else {
            // Comprobar que no me salgo de la lista de filas
            if (index < rows.length - 1) {
                rows[index + 1].classList.add(SELECTED_CLASS);
            } else {
                start.classList.add(SELECTED_CLASS);
            }
        }
    } else if (e.key === "Enter") {
        // Tecla enter / intro: seleccionar línea resaltada.
        if (index !== null) {
            rows[index].click();
        }
    }
}

/**
 * Propiedades del componente.
 */
interface ISuggestionBoxProps {
    entity: any;
    valueName: string;
    isRequired?: boolean;
    isEditing?: boolean;
    label: string | React.ReactNode;
    id: string;
    minLength?: number;
    maxLength?: number;
    size?: number;
    idFieldName: string;
    suggestAction(params?: any): any;
    findAction(params?: any): any;
}

/**
 * Componente SuggestionBox.
 * 
 * @param {*} props 
 * @returns 
 */
export default function SuggestionBox(props: ISuggestionBoxProps) {
    // Estado inicial a partir de las propiedades
    const [value, setValue] = useState<string>(props.entity[props.valueName] !== undefined && props.entity[props.valueName] !== null ? props.entity[props.valueName] : "");
    const [entity, setEntity] = useState<any>(props.entity);
    const [isEditing, setIsEditing] = useState<boolean | undefined>(props.isEditing);
    const [result, setResult] = useState<Array<any> | null>(null);

    const [focusOn, setFocusOn] = useState<boolean>(false);
    // Lo utilizo para mostrar un mensaje mientras está buscando
    const [isSearching, setIsSearching] = useState<boolean>(false);

    // Timer para búsquedas: lo declaro como referencia porque si lo declarase como estado forzaría el rerenderizado del componente y por tanto al intentar eliminar
    // el timer al desmontar el componente no funcionaría al ser diferente tras cada rerenderizado.
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Obtener datos de las propiedades
    const { label, minLength, id } = props;


    useEffect(() => {
        setIsEditing(props.isEditing);
    }, [props.isEditing]);

    // Si cambia la entidad asociada, debe volver a renderizarse.
    useEffect(() => {
        setValue(props.entity[props.valueName] !== undefined && props.entity[props.valueName] !== null ? props.entity[props.valueName] : "");
        setEntity(props.entity);
    }, [props.entity, props.valueName]);

    // Para detectar el click fuera del componente
    // useRef crea un objeto ref mutable que se mantendrá con persistente durante todo el ciclo de vida del componente. 
    // useRef es como una “caja” que se puede mantener en una variable mutable en su propiedad .current. Lo utilizaré sobre la división contenedora de input y tabla de resultados.
    const wrapperRef: React.MutableRefObject<any> = useRef<any>(null);
    const [isResultTableVisible, setIsResultTableVisible] = useState(false);

    // Otra referencia, ésta para el propio input
    const inputRef: React.MutableRefObject<any> = useRef<any>(null);

    /**
     * Función para manejar el click fuera del componente
     */
    const handleClickOutside: Function = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
            setIsResultTableVisible(false);
            resetEntity();
        }
    };

    /**
     * Utilizar un efecto para añadir un eventListener al hacer click
     */
    useEffect(() => {
        document.addEventListener("click", handleClickOutside as EventListenerOrEventListenerObject, false);
        // Eliminar el listener después para que no lo lance siempre que se haga click fuera del componente: sólo debe hacerlo la primera vez tras hacer click fuera del componente
        return () => {
            document.removeEventListener("click", handleClickOutside as EventListenerOrEventListenerObject, false);
        };
    });

    /**
     * Efecto para hacer foco sobre el elemento a partir de atributo de estado, focusOn.
     */
    useEffect(() => {
        if (focusOn && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
            // Importante "apagar" el foco después de seleccionar el elemento.
            setFocusOn(false);
        }
    }, [focusOn]);

    // Esto sería el componentWillUnmount: tengo que eliminar el timer cuando el suggestionbox vaya a desaparecer del DOM.
    useEffect(() => {
        // Dentro del return sería lo que va a ejecturarse al desaparecer el componente.
        return () => {
            if (timerRef !== null) {
                clearTimeout(timerRef.current as unknown as NodeJS.Timeout);
            }
        }
    }, []);

    /**
     * Función para resetear la entidad si se ha click fuera de la división sin haber seleccionado objeto. 
     */
    const resetEntity = () => {
        // Si no se ha seleccionado elemento (es decir, el id es null), limpiar el componente
        if (entity[props.idFieldName] === null) {
            // Borrar el código seleccionado de la entidad y settearla en el componente
            entity[props.valueName] = null;
            setEntity(entity);
            // Vaciar input
            setValue("");
            setIsResultTableVisible(false);
        }
    }

    /**
     * Manejar presionado de teclas mientras está puesto el foco sobre el input.
     * 
     * @param {event} e 
     */
    const handleKeyDown = (e: React.KeyboardEvent): any => {
        switch (e.key) {
            case 'Tab':
                resetEntity();
                break;

            case 'Enter':
            case 'ArrowUp':
            case 'ArrowDown':
                // Si está visible la tabla de sugerencias, ejecutar la rutina de comprobación de tecla presionada
                if (isResultTableVisible) {
                    checkKey(e, id);
                }
                // Si es la tecla enter, prevenir el comportamiento por defecto para que no haga submit del formulario
                if (e.key === 'Enter') {
                    e.preventDefault();
                }
                break;

            default:
                break;
        }
    }


    // Si no se ha especificado máximo de caracteres, máximo 50
    const maxLength = props.maxLength === undefined ? 50 : props.maxLength;

    // Si no se ha especificado tamaño, por defecto el máximo de caracteres más 5 para que sea un poco más grande y no quede mal
    const size = props.size !== null && props.size !== undefined ? props.size : maxLength + 5;

    /**
     * Manejar onChange.
     * 
     * @param {event} event 
     */
    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        // Tras un cambio en el input, actualizo también la entidad del modelo
        var newValue: string = event.target.value;
        // El cambio de estado es tanto del valor del input como de la entidad, para mantenerla actualizada 
        setValue(newValue);

        // Importante: cada vez que escriban hay que resetear la entidad seleccionada
        entity[props.valueName] = newValue;
        // El id lo pongo a null
        entity[props.idFieldName] = null;
        setEntity(entity);

        // Si ha introducido más de dos caracterres, comenzar acción de suggestion (revisar por qué sólo funciona con length > 1).
        if (newValue !== undefined && newValue !== null && newValue.length > 1) {
            // Activo el modo de búsqueda activa
            setIsSearching(true);

            // Establezco un timeout para que no empiece a buscar hasta pasado unos milisegundos y dar tiempo a que el usuario termine de escribir
            timerRef.current = setTimeout(async () => {
                // Búsqueda asíncrona
                await props.suggestAction(newValue).then(
                    (result: any) => {
                        setResult(result);
                        // Visualizar la tabla de resultados
                        setIsResultTableVisible(true);
                        // Desactivo el modo de búsqueda activa
                        setIsSearching(false);
                    }
                );
            }, 500);
        }
    }

    /**
     * Acción de selección del ítem.
     * 
     * @param {obj} item 
     */
    const selectItem = (item: any) => {
        // Establecer valor del input así como valor del id y código de la entidad
        setValue(item[props.valueName]);
        entity[props.valueName] = item[props.valueName];
        entity[props.idFieldName] = item[props.idFieldName];
        setEntity(entity);

        // Ocultar tabla de resultados
        setIsResultTableVisible(false);

        // a partir de este atributo de estado se ejecutará un efecto que establecerá el foco sobre el componente en el próximo render
        setFocusOn(true);
    }

    // Preparar tabla de sugerencias si hay resultado y si es visible (es decir, no se ha "salido" del componente haciendo click fuera)
    const suggestionTable = isResultTableVisible && (result !== undefined && result !== null && result.length > 0 ?
        makeTableForSuggestionBox(id, result, selectItem, props.idFieldName) : null);

    // Label de campo obligatorio
    const requiredLabel = props.isRequired ? <span style={{ color: 'red', fontWeight: 'bold', float: 'left', marginLeft: '5px' }}>*</span> : null;

    // Acción de búsqueda. Utilizo preventDefault para evitar que se accione el submit del formulario.
    const findAction = function (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) {
        e.preventDefault();
        props.findAction();
        return false;
    };

    // Botón de búsqueda
    const findButton = <ImageButton style={{ marginLeft: '5px' }} className='find-button' onClick={findAction} disabled={!isEditing ? true : false} />

    // Etiqueta de búsqueda activa
    const searchMessage = isSearching ? <FormattedMessage id="i18n_common_searching" /> : null;

    // Tiene posición relativa porque la tabla interior de suggestion-box debe tenerla absoluta para así solapar cualquier elemento que tenga debajo. 
    return (<div className="input-panel" style={{ position: 'relative' }} ref={wrapperRef}>

        <label htmlFor={id} className="my-label">{label}</label>

        <div style={{ marginLeft: '2px', float: 'left' }}>

            <input
                id={id}
                ref={inputRef}
                style={{ float: 'left' }}
                type="text"
                className="my-input"
                size={size}
                maxLength={maxLength}
                minLength={minLength}
                value={value}
                disabled={!isEditing ? true : false}
                required={props.isRequired ? true : false}
                onKeyDown={handleKeyDown}
                onChange={handleChange} />

            {requiredLabel}

            {findButton}

        </div>

        {suggestionTable}
        {searchMessage}

    </div>);

}