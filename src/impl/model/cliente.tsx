import BaseEntity from './../../core/model/base_entity';
import TipoCliente from './tipo_cliente';
import Usuario from './usuario';

/**
 * Modelo de entidad cliente.
 */
export default class Cliente extends BaseEntity {

    id: number;
    codigo: string;
    nombre: string;
    apellidos: string;
    saldo: number | null;
    tipo_cliente: TipoCliente | null;
    usuario_creacion: Usuario | null;
    usuario_ult_mod: Usuario | null;

    // CONTRUCTOR
    constructor(id: number, codigo: string, saldo: number | null = null, tipo_cliente: TipoCliente, nombre: string, apellidos: string,
        usuario_creacion: Usuario | null = null, usuario_ult_mod: Usuario | null = null) {
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

}