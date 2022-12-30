import BaseEntity from './../../core/model/base_entity';
import TipoCliente from './tipo_cliente';
import Usuario from './usuario';

import { get_property_value_by_name } from "./../../core/utils/helper-utils";

/**
 * Modelo de entidad cliente.
 */
export default class Cliente extends BaseEntity {

    id: number | null;
    codigo: string | null;
    nombre: string | null;
    apellidos: string | null;
    saldo: number | null;
    tipo_cliente: TipoCliente | null;
    usuario_creacion: Usuario | null;
    usuario_ult_mod: Usuario | null;

    // CONTRUCTOR
    constructor(id: number | null = null, codigo: string | null = null, saldo: number | null = null, tipo_cliente: TipoCliente | null = null, nombre: string | null = null,
        apellidos: string | null = null, usuario_creacion: Usuario | null = null, usuario_ult_mod: Usuario | null = null) {
        super();
        this.id = id;
        this.codigo = codigo;
        this.saldo = saldo;
        this.tipo_cliente = tipo_cliente;
        this.nombre = nombre;
        this.apellidos = apellidos;
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
        const json_props = ['id', 'codigo', 'saldo', 'tipo_cliente', 'nombre', 'apellidos', 'usuario_creacion', 'usuario_ult_mod'];
        return json_props;
    }

    /**
     * Deserializa un objeto json.
     * 
     * @param serialized 
     * @returns Cliente
     */
    public static fromJSON(serialized: any): Cliente {
        let object_clause: ReturnType<Cliente["toObject"]>;

        // Si fuese un string, parsearlo
        if (typeof serialized === 'string') {
            object_clause = JSON.parse(serialized);
        } else {
            object_clause = serialized;
        }

        // Comprobar objetos anidados
        // Usuarios
        Usuario.checkUsuariosFromJsonObject(object_clause);

        // Tipo de cliente
        if (get_property_value_by_name(object_clause, "tipo_cliente") === undefined) {
            Object.assign(object_clause, { tipo_cliente: null });
        }
        // Si no es null, parsearlo desde json
        if (get_property_value_by_name(object_clause, "tipo_cliente") !== null) {
            Object.assign(object_clause, { tipo_cliente: TipoCliente.fromJSON(get_property_value_by_name(object_clause, "tipo_cliente")) });
        }

        const clause_ = object_clause as Cliente;

        return new Cliente(
            clause_.id,
            clause_.codigo,
            clause_.saldo,
            clause_.tipo_cliente,
            clause_.nombre,
            clause_.apellidos,
            clause_.usuario_creacion,
            clause_.usuario_ult_mod
        )
    }

}