import { get_property_by_name } from "../utils/helper-utils";

/**
 * Clase para serializar objetos y deserializarlos desde json.
 */
export default abstract class Serializable {

    /**
     * Devuelve un objeto plano para serializar a json.
     * 
     * @returns {}
     */
    protected toObject() {
        // Creo un objeto vacío y voy completando los datos.
        const object_result = {};
        // Obtengo un array de strings con las propiedades de la clase.
        const my_props = Object.getOwnPropertyNames(this);
        // Declaro el nuevo valor a añadir al objeto serializado así como la clave para el mapeo de la propiedad
        let key_value: any;
        let attr: any;
        let value: any;
        let key: string;

        // Bucle recorriendo las propiedades de la instancia del objeto y completando el diccionario serializado
        for (let i = 0; i < my_props.length; i++) {
            key = my_props[i];
            attr = get_property_by_name(this, key);

            // Si el atributo fuese una instancia de esta misma clase, serializarla también.
            if (attr instanceof Serializable) {
                value = attr.toObject();
            } else if (attr instanceof Array<Serializable>) {
                // Si fuese un array de objetos también serializables, ir uno por uno y convertirlos a objeto.
                value = [];
                for (let j = 0; j < attr.length; j++) {
                    value[j] = attr[j].toObject();
                }
            } else {
                value = attr;
            }

            // Lo añado al mapa
            key_value = {
                key: value,
            }
            // Establezco el valor en el objeto resultado.
            Object.assign(object_result, key_value);
        }

        return object_result;
    }

    /**
     * Serializa el objeto a json.
     * 
     * @returns json string
     */
     public serialize(): string {
        return JSON.stringify(this.toObject());
    }

    /**
     * Función estática a sobrescribir en las clases que implementen Serializable. 
     * Deserializa un json para convertirlo a una instancia de la clase.
     * 
     * @param serialized 
     */
    public static fromJSON(serialized: string) {
        throw new Error("not implemented!");
    }

}