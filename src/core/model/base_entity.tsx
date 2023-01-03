import { generateUuid, get_property_value_by_name, stringToDateTime } from '../utils/helper-utils'
import Serializable from './serializable';

export default abstract class BaseEntity extends Serializable {

    // CAMPOS
    /**
     * Id único para evitar problemas en tablas y listados de react.
     */
    protected uuid_: string

    /**
     * Mapa de errores por atributo. Necesario para la validación en los formularios. La clave es un string con el nombre de la propiedad errónea; 
     * el valor es una tupla con el error y el valor erróneo. Merece la pena almacenar el valor erróneo porque si se cambia el valor de la propiedad desde otro punto, se puede 
     * comparar el valor actual con el almacenado junto al error para saber si ha cambiado y si es así eliminar el error del mapa.
    */
    protected errorMessagesInForm_: Map<string, [string, string]>

    // CONSTRUCTOR
    constructor() {
        super();
        this.uuid_ = generateUuid();
        this.errorMessagesInForm_ = new Map();
    }

    // GETTERS Y SETTERS
    public get uuid(): string {
        return this.uuid_;
    }

    public get errorMessagesInForm(): Map<string, [string, string]> {
        return this.errorMessagesInForm_;
    }

    // MÉTODOS
    /**
     * Devuelve el nombre del campo código de la entidad.
     * 
     * @returns {string} Nombre del campo código de la entidad.
     */
    public static getCodigoFieldName(): string {
        return "codigo";
    }

    /**
     * Devuelve el nombre del campo id de la entidad.
     * 
     * @returns {string} Nombre del campo id de la entidad.
     */
    public static getIdFieldName(): string {
        return "id";
    }

    /**
     * Devuelve el valor del campo id.
     * 
     * @returns Valor del campo id. Devuelve null si fuese undefined.
     */
    public getIdFieldValue(): any {
        const idValue = get_property_value_by_name(this, BaseEntity.getIdFieldName()); 
        return idValue !== undefined ? idValue : null;
    }

    /**
     * Devuelve el valor del campo código.
     * 
     * @returns Valor del campo código. Devuelve null si fuese undefined.
     */
    public getCodigoFieldValue(): any {
        const codigoValue = get_property_value_by_name(this, BaseEntity.getCodigoFieldName()); 
        return codigoValue !== undefined ? codigoValue : null;
    }

    /**
     * Comprueba las fechas en un objeto plano de JS para el parseo de json a objeto.
     * 
     * @param object_clause Objeto JS plano.
     */
    protected static checkDatesFromJsonObject(object_clause: {}): void {
        if (get_property_value_by_name(object_clause, "fechacreacion") === undefined) {
            Object.assign(object_clause, { fechacreacion: null });
        }

        if (get_property_value_by_name(object_clause, "fechaultmod") === undefined) {
            Object.assign(object_clause, { fechaultmod: null });
        }

        // La fecha será un string, con lo cual habrá que parsearla a Date
        if (typeof get_property_value_by_name(object_clause, "fechacreacion") === "string") {
            Object.assign(object_clause, { fechacreacion: stringToDateTime(get_property_value_by_name(object_clause, "fechacreacion")) });
        }

        if (typeof get_property_value_by_name(object_clause, "fechaultmod") === "string") {
            Object.assign(object_clause, { fechaultmod: stringToDateTime(get_property_value_by_name(object_clause, "fechaultmod")) });
        }
    }

}