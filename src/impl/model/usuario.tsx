import BaseEntity from './../../core/model/base_entity';

/**
 * Modelo de entidad usuario.
 */
export default class Usuario extends BaseEntity {

    id: number;
    username: string;
    password: string;

    // CONTRUCTOR
    constructor(id: number, username: string, password: string) {
        super();
        this.id = id;
        this.username = username;
        this.password = password;
    }

    // MÉTODOS
    /**
     * Método estático a implementar. Devuelve un array de strings con las propiedades de la clase a exportar en json.
     * 
     * @returns Listado de propiedades a exportar en json. 
     */
    getPropertiesList() {
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

}