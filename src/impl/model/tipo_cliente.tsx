import BaseEntity from './../../core/model/base_entity';

import Usuario from './usuario';

/**
 * Modelo de entidad tipo de cliente.
 */
export default class TipoCliente extends BaseEntity {

    id: number | null;
    codigo: string | null;
    descripcion: string | null;
    usuario_creacion: Usuario | null;
    usuario_ult_mod: Usuario | null;
    fechacreacion: Date | null;
    fechaultmod: Date | null;

    // CONTRUCTOR
    constructor(id: number | null = null, codigo: string | null = null, descripcion: string | null = null,
        usuario_creacion: Usuario | null = null, usuario_ult_mod: Usuario | null = null,
        fechacreacion: Date | null = null, fechaultmod: Date | null = null) {
        super();
        this.id = id;
        this.codigo = codigo;
        this.descripcion = descripcion;
        this.usuario_creacion = usuario_creacion;
        this.usuario_ult_mod = usuario_ult_mod;
        this.fechacreacion = fechacreacion;
        this.fechaultmod = fechaultmod;
    }

    // MÉTODOS
    /**
     * Método estático a implementar. Devuelve un array de strings con las propiedades de la clase a exportar en json.
     * 
     * @returns Listado de propiedades a exportar en json. 
     */
    getPropertiesList() {
        const json_props = ['id', 'codigo', 'descripcion', 'usuario_creacion', 'usuario_ult_mod', 'fechacreacion', 'fechaultmod'];
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

        // Comprobar objetos anidados
        // Usuarios
        Usuario.checkUsuariosFromJsonObject(object_clause);

        // Comprobar fechas del objeto plano
        super.checkDatesFromJsonObject(object_clause);

        const clause_ = object_clause as TipoCliente;

        return new TipoCliente(
            clause_.id,
            clause_.codigo,
            clause_.descripcion,
            clause_.usuario_creacion,
            clause_.usuario_ult_mod,
            clause_.fechacreacion,
            clause_.fechaultmod
        )
    }

}