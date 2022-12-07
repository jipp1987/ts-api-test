import Serializable from '../model/serializable';
import { number_format } from '../utils/helper-utils';

/**
 * Clase de ayuda para modelar las cabeceras de las tablas.
 */
export default class DataTableHeader extends Serializable {

    _index: number;
    _field_name: string;
    _field_label: string;
    _width: string;
    _field_format: string | null;
    _order_state: string | null;

    // CONTRUCTOR
    constructor(index: number, field_name: string, field_label: string, width: string, field_format: string | null = null, order_state: string | null = null) {
        super();
        /**
         * Índice que ocupará dentro del orden de las cabeceras de la tabla.
         */
        this._index = index;

        /**
         * Nombre del campo a nivel de modelo de datos.
         */
        this._field_name = field_name;

        /**
         * Etiqueta de visualización.
         */
        this._field_label = field_label;

        /**
         * Ancho.
         */
        this._width = width;

        /**
         * Formato de campo.
         */
        this._field_format = field_format;

        /**
         * Estado del orden (null, ASC, DESC)
         */
        this._order_state = order_state;
    }

    // GETTERS Y SETTERS
    get index() {
        return this._index
    }

    set index(index) {
        this._index = index
    }

    get field_name() {
        return this._field_name
    }

    set field_name(field_name) {
        this._field_name = field_name
    }

    get field_label() {
        return this._field_label
    }

    set field_label(field_label) {
        this._field_label = field_label
    }

    get field_format() {
        return this._field_format
    }

    set field_format(field_format) {
        this._field_format = field_format
    }

    get order_state() {
        return this._order_state
    }

    set order_state(order_state) {
        this._order_state = order_state
    }

    get width() {
        return this._width
    }

    set width(width) {
        this._width = width
    }

    // FUNCIONES
    /**
     * Convierte un valor de acuerdo con el formato de la cabecera.
     * @param {*} value 
     * @returns value
     */
    convert_value_as_header_format(value: number) {
        if (value != null) {
            switch (this._field_format) {
                case 'FLOAT':
                    return number_format(value, 2, ',', '.');
                case 'INTEGER':
                case 'DATE':
                case 'DATETIME':
                case 'NONE':
                default:
                    return value;
            }
        } else {
            return null;
        }
    }

    /**
     * Deserializa un objeto json.
     * 
     * @param serialized 
     * @returns DataTableHeader
     */
     public static fromJSON(serialized: string): DataTableHeader {
        const object_clause: ReturnType<DataTableHeader["toObject"]> = JSON.parse(serialized);
        const clause_ = object_clause as DataTableHeader;
        
        return new DataTableHeader(
            clause_._index,
            clause_._field_name,
            clause_._field_label,
            clause_._width,
            clause_._field_format,
            clause_._order_state
        )
    }

}