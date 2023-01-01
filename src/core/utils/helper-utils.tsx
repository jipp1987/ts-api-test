import uuid from 'react-uuid';
import moment from 'moment';

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
 * Devuelve el valor del campo de un objeto según el nombre de la propiedad.
 * 
 * @param owner_of_prop Objeto a inspeccionar.
 * @param prop_name Nombre de la propiedad.
 * @returns Valor actual del campo.
 */
export function get_property_value_by_name(owner_of_prop: any, prop_name: string): any {
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
 * Convierte un string con formato YYYY-MM-DD HH:mm:ss a un objeto Date de typescript.
 * 
 * @param dateString Formato YYYY-MM-DD HH:mm:ss
 * @returns Date
 */
export function stringToDateTime(dateString: string): Date {
    // Separo el día de la hora
    const [dateComponents, timeComponents] = dateString.split(' ');
    // El separador del año, mes y día es un guión
    const [year, month, day] = dateComponents.split('-');
    // El de la hora los dos puntos
    const [hours, minutes, seconds] = timeComponents.split(':');
    // Le resto uno al mes porque el constructor supone que el mes cero es enero
    return new Date(+year, +month - 1, +day, +hours, +minutes, +seconds);
}

/**
 * Convierte un string a fecha.
 * @param date_ 
 * @param date_format Formato por defecto: YYYY-MM-DD HH:mm:ss
 * @returns 
 */
export function dateToString(date_: Date, date_format: string = "YYYY-MM-DD HH:mm:ss"): string {
    return (moment(date_)).format(date_format);
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