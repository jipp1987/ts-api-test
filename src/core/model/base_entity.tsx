import { generateUuid } from '../utils/helper-utils'
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
    public getCodigoFieldName(): string {
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
     * Método a implementar. Devuelve un array de strings con las propiedades de la clase a exportar en json.
     */
    public abstract getPropertiesList(): string[];

    /**
    * Devuelve un diccionario con las propiedades del objeto para enviarlo como json a una api.
    */
    public toJsonDict(): { [key: string]: any } {
        // Obtengo las propiedades a exportar.
        const json_properties: string[] = this.getPropertiesList();

        // Devuelvo un diccionario con esas propiedades estrictamente, para descartar cualquier otro campo que no pertenezca al modelo de la base de datos.
        var json_dict: { [key: string]: any } = {};

        for (var i = 0; i < json_properties.length; i++) {
            let dynamicKey = json_properties[i] as keyof this;

            // Descartar aquellas propiedades undefined.
            if (this[dynamicKey] !== undefined) {
                // Importante comprobar si alguna de las propiedades es un objeto que sea también una BaseEntity, en ese caso deberá llamar a su propio toJsonDict.
                if (this[dynamicKey] !== null && this[dynamicKey] instanceof BaseEntity) {
                    json_dict[json_properties[i]] = (this[dynamicKey] as BaseEntity).toJsonDict();
                } else {
                    json_dict[json_properties[i]] = this[dynamicKey];
                }
            }
        }

        return json_dict;
    }

}