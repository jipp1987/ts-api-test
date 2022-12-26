import React from 'react';

import DataTableHeader from '../../core/view/table-header';
import { FieldClause, JoinClause, JoinTypes } from '../../core/utils/dao-utils';
import ViewController from '../../core/view/view-controller';
import { ICoreControllerProps } from '../../core/view/core-controller';
import Cliente from '../model/cliente';
import { FormattedMessage } from "react-intl";

/**
 * @class Controlador de mantenimiento de clientes.
 */
export default class ClienteView extends ViewController<Cliente> {

    /**
     * Crea una instancia del controlador de vista.
     * 
     * @param {props} 
     */
    constructor(props: ICoreControllerProps) {
        super(props);

        /**
         * Clase de la entidad principal.
         */
        this.entity_class = Cliente;

        /**
         * Nombre de la clase.
         */
        this.table_name = "Cliente";

        /**
         * Título de la vista.
         */
        this.view_title = "i18n_clientes_title";

        /**
         * Nombre del campo id.
         */
        this.id_field_name = this.entity_class.getIdFieldName();

        /**
         * Campos para la SELECT.
         */
        this.fields = [
            new FieldClause("id", null),
            new FieldClause("tipo_cliente.usuario_ult_mod.username", null),
            new FieldClause("codigo", null),
            new FieldClause("nombre", null),
            new FieldClause("tipo_cliente.usuario_creacion.username", null),
            new FieldClause("tipo_cliente.codigo", null),
        ];

        this.joins = [
            new JoinClause("tipo_cliente", JoinTypes.INNER_JOIN, false),
            new JoinClause("tipo_cliente.usuario_creacion", JoinTypes.LEFT_JOIN, false),
            new JoinClause("tipo_cliente.usuario_ult_mod", JoinTypes.LEFT_JOIN, false)
        ];

        /**
         * Array de objetos HeaderHelper para modelar las cabeceras.
         */
        this.headers = [
            new DataTableHeader(0, 'codigo', 'i18n_common_code', '80px', null),
            new DataTableHeader(1, 'nombre', 'i18n_common_name', '80px', null),
            new DataTableHeader(2, 'tipo_cliente.codigo', 'i18n_clientes_customer_type', '80px', null),
            new DataTableHeader(3, 'tipo_cliente.usuario_creacion.username', 'i18n_common_usuario_creacion', '100px', null),
            new DataTableHeader(4, 'tipo_cliente.usuario_ult_mod.username', 'i18n_common_usuario_ult_mod', '100px', null)
        ];
    }

}