import uuid from 'react-uuid';

// Definición de tokens para almacenamiento en localStorage
/**
 * Cadena para delimitar los distintos tokens del identificador.
 */
export const SAVE_DELIMITER: string = "$$";
/**
 * Separador para el identificador del token.
 */
export const SAVE_SEPARATOR = "@@";
/**
 * Token para indicar la pestaña.
 */
export const TAB_SAVE_SEPARATOR = "tab";
/**
 * Token para identificar el modal en caso de que sea un controlador modal.
 */
export const MODAL_SAVE_SEPARATOR = "modal";
/**
 * Token para identificar la propiedad.
 */
export const PROPERTY_SAVE_SEPARATOR = "property";
/**
 * Token para identificar si es variable de estado o no.
 */
export const STATE_SAVE_SEPARATOR = "state";

/**
 * Identificador para pestañas que van a ser eliminadas. Se utiliza para que al cerrar una pestaña, componentWillUnmount no vuelva a guardar los datos en localStorage.
 */
export const TAB_TO_DELETE = "dontSaveThisTab";

// Otros campos

/**
 * Estados y acciones de los controladores de vista.
 */
export const ViewStates = {
    LIST: "LIST",
    VALIDATE: "VALIDATE",
    DETAIL: "DETAIL",
    EDIT: "EDIT",
    DELETE: "DELETE",
}

/**
 * Validadores de vista.
 */
export const ViewValidators = {
    CODE_VALIDATOR: "CODE_VALIDATOR",
    IS_NUMERIC_VALIDATOR: "IS_NUMERIC_VALIDATOR",
}

/**
 * Códigos de acción para la API.
 */
export const APIActionCodes = {
    CREATE: 1,
    EDIT: 2,
    DELETE: 3,
    SELECT: 4,
}

/**
 * Códigos de acción para la API.
 */
export const SelectActions = {
    COUNT: 1,
}

/**
 * Accede a un miembro de un objeto a partir de un string, por ejemplo: nested1.nested2
 * 
 * @param {*} path 
 * @param {*} obj 
 * @param {*} separator 
 * @returns any
 */
export function resolve_property_by_string(path: (string | Array<string>), obj: any, separator: string = '.') {
    var properties = Array.isArray(path) ? path : path.split(separator)
    return properties.reduce((prev, curr) => prev && prev[curr], obj)
}

/**
 * Devuelve el valor del campo de un objeto.
 * 
 * @param owner_of_prop Objeto a inspeccionar.
 * @param prop_name Nombre de la propiedad.
 * @returns Valor actual del campo.
 */
export function get_property_by_name(owner_of_prop: any, prop_name: string): any {
    type ObjectKey = keyof typeof owner_of_prop;
    const myVar = prop_name as ObjectKey;

    return owner_of_prop[myVar];
}

/**
 * Da formato a un string numérico.
 * 
 * @param {*} number 
 * @param {*} decimals 
 * @param {*} dec_point 
 * @param {*} thousands_sep 
 * @returns 
 */
export function number_format(number: number, decimals: number, dec_point: string, thousands_sep: string) {
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        toFixedFix = function (n: number, prec: number) {
            // Fix para IE parseFloat(0.55).toFixed(0) = 0;
            var k = Math.pow(10, prec);
            return Math.round(n * k) / k;
        },
        s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}

/**
 * Foco en el siguiente elemento del formulario.
 * 
 * @param {*} currentElementId Id del elemento actual.
 */
export function focusNextElement(currentElementId: string) {
    // Busco el elemento actual en el formulario.
    var currentElement = document.getElementById(currentElementId);

    // Selector de elementos sobre los que se puede hacer foco.
    var focussableElements = 'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
    var universe = document.querySelectorAll(focussableElements);
    var list = Array.prototype.filter.call(universe, function (item) { return item.tabIndex >= "0" });

    var index = list.indexOf(currentElement);
    // Obtengo el siguiente elemento partiendo del actual (o bien el primero si fuese el último).
    var nextFocusElement = list[index + 1] || list[0];

    // Foco y selección
    if (nextFocusElement !== null && nextFocusElement !== undefined) {
        nextFocusElement.focus();

        // Si además es un input, seleccionar el texto
        if (nextFocusElement.tagName === "INPUT") {
            nextFocusElement.select();
        }
    }
}

/**
 * Devuelve un uuid generado aleatoriamente.
 * 
 * @returns string
 */
export function generateUuid(): string {
    return uuid();
}

/**
 * Fuerza el evento onBlur de todos los elementos activos del formulario.
 */
export function forceOnBlur() {
    document.querySelectorAll('input,textarea').forEach(function (element) {
        if (element === document.activeElement) {
            return (element as HTMLElement).blur();
        }
    });
}

/**
 * Elimina los datos de localStorage correspondientes a una pestaña.
 * 
 * @param {number} tab 
 */
export function delete_from_localStorage_by_tab(tab: number): void {
    const keys_to_delete = [];

    let key: string | null;
    for (let i = 0; i < localStorage.length; i++) {
        key = localStorage.key(i);

        if (key !== undefined && key !== null && key.startsWith(TAB_SAVE_SEPARATOR + SAVE_SEPARATOR + tab)) {
            keys_to_delete.push(key);
        }
    }

    for (let i = 0; i < keys_to_delete.length; i++) {
        localStorage.removeItem(keys_to_delete[i]);
    }
}

/**
 * Modelado para modales. 
 */
export class ModalHelper {

    parentContainer?: string;
    id?: string;
    title: string;
    modal_width?: string;
    content?: React.ReactNode;

    // CONTRUCTOR
    constructor(title: string, id: string, parentContainer: string, content: React.ReactNode, modal_width: string) {
        this.title = title;
        this.id = id;
        this.parentContainer = parentContainer;
        this.content = content;
        this.modal_width = modal_width;
    }

}