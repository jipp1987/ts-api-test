import { generateUuid, get_property_value_by_name, stringToDateTime } from '../utils/helper-utils'
import Serializable from './serializable';

export default abstract class BaseEntity extends Serializable {

    // CAMPOS
    /**
     * Id único para evitar problemas en tablas y listados de react.
     */
    protected uuid_: string

    // CONSTRUCTOR
    constructor() {
        super();
        this.uuid_ = generateUuid();
    }

    // GETTERS Y SETTERS
    public get uuid(): string {
        return this.uuid_;
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