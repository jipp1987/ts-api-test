import BaseEntity from './../../core/model/base_entity';
import Usuario from './usuario';

/**
 * Modelo de entidad tipo de cliente.
 */
export default class TipoCliente extends BaseEntity {

    id: number;
    codigo: string;
    descripcion: string;
    usuario_creacion: Usuario | null;
    usuario_ult_mod: Usuario | null;

    // CONTRUCTOR
    constructor(id: number, codigo: string, descripcion: string, usuario_creacion: Usuario | null = null, usuario_ult_mod: Usuario | null = null) {
        super();
        this.id = id;
        this.codigo = codigo;
        this.descripcion = descripcion;
        this.usuario_creacion = usuario_creacion;
        this.usuario_ult_mod = usuario_ult_mod;
    }

    // MÉTODOS
    /**
     * Método estático a implementar. Devuelve un array de strings con las propiedades de la clase a exportar en json.
     * 
     * @returns Listado de propiedades a exportar en json. 
     */
    getPropertiesList() {
        const json_props = ['id', 'codigo', 'descripcion', 'usuario_creacion', 'usuario_ult_mod'];
        return json_props;
    }

    /**
     * Deserializa un objeto json.
     * 
     * @param serialized 
     * @returns TipoCliente
     */
     public static fromJSON(serialized: any): TipoCliente {
        let object_clause: ReturnType<TipoCliente["toObject"]>;
        
        // Si fuese un string, parsearlo
        if (typeof serialized === 'string') {
            object_clause = JSON.parse(serialized);
        } else {
            object_clause = serialized;
        }
        
        const clause_ = object_clause as TipoCliente;
        
        if (clause_.usuario_creacion === undefined) {
            clause_.usuario_creacion = null;
        }

        if (clause_.usuario_ult_mod === undefined) {
            clause_.usuario_ult_mod = null;
        }

        return new TipoCliente(
            clause_.id,
            clause_.codigo,
            clause_.descripcion,
            clause_.usuario_creacion,
            clause_.usuario_ult_mod
        )
    }

}