import BaseEntity from './../../core/model/base_entity';
import { get_property_value_by_name } from "./../../core/utils/helper-utils";

/**
 * Modelo de entidad usuario.
 */
export default class Usuario extends BaseEntity {

    id: number | null;
    username: string | null;
    password: string | null;
    repeatPassword: string | null | undefined;

    // CONTRUCTOR
    constructor(id: number | null = null, username: string | null = null, password: string | null = null) {
        super();
        this.id = id;
        this.username = username;
        this.password = password;
    }

    // MÉTODOS
    /**
     * Sobrescritura. Devuelve un array de strings con las propiedades de la clase a exportar en json.
     * 
     * @returns Listado de propiedades a exportar en json. 
     */
    public getPropertiesList() {
        const json_props = ['id', 'username', 'password'];
        return json_props;
    }

    /**
     * Deserializa un objeto json.
     * 
     * @param serialized 
     * @returns Usuario
     */
    public static fromJSON(serialized: any): Usuario {
        let object_clause: ReturnType<Usuario["toObject"]>;

        // Si fuese un string, parsearlo
        if (typeof serialized === 'string') {
            object_clause = JSON.parse(serialized);
        } else {
            object_clause = serialized;
        }

        const clause_ = object_clause as Usuario;

        return new Usuario(
            clause_.id,
            clause_.username,
            clause_.password
        )
    }

    /**
     * Comprueba los usuarios de creación y última modificación de un object plano de JS para el parseo de json.
     * 
     * @param json_object 
     */
    public static checkUsuariosFromJsonObject(json_object: {}): void {
        if (get_property_value_by_name(json_object, "usuario_creacion") === undefined) {
            Object.assign(json_object, { usuario_creacion: null });
        }
        // Si no es null, parsearlo desde json
        if (get_property_value_by_name(json_object, "usuario_creacion") !== null) {
            Object.assign(json_object, { usuario_creacion: Usuario.fromJSON(get_property_value_by_name(json_object, "usuario_creacion")) });
        }

        if (get_property_value_by_name(json_object, "usuario_ult_mod") === undefined) {
            Object.assign(json_object, { usuario_ult_mod: null });
        }
        if (get_property_value_by_name(json_object, "usuario_ult_mod") !== null) {
            Object.assign(json_object, { usuario_ult_mod: Usuario.fromJSON(get_property_value_by_name(json_object, "usuario_ult_mod")) });
        }
    }

}