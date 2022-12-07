import React from 'react';

import DataTableHeader from '../../core/view/table-header';
import MyInput from '../../core/components/input-text';
import { FieldClause } from '../../core/utils/dao-utils';
import ViewController from '../../core/view/view-controller';
import { ICoreControllerProps } from '../../core/view/core-controller';
import TipoCliente from '../model/tipo_cliente';
import { FormattedMessage } from "react-intl";
import { ViewValidators } from '../../core/utils/helper-utils';

/**
 * @class Controlador de mantenimiento de clientes.
 */
export default class TipoClienteView extends ViewController<TipoCliente> {

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
        this.entity_class = TipoCliente;

        /**
         * Nombre de la clase.
         */
        this.table_name = "TipoCliente";

        /**
         * Título de la vista.
         */
        this.view_title = "i18n_tipos_cliente_title";

        /**
         * Nombre del campo id.
         */
        this.id_field_name = this.entity_class.getIdFieldName();

        /**
         * Campos para la SELECT.
         */
        this.fields = [
            new FieldClause("id", null),
            new FieldClause("codigo", null),
            new FieldClause("descripcion", null),
        ];

        /**
         * Array de objetos HeaderHelper para modelar las cabeceras.
         */
        this.headers = [
            new DataTableHeader(0, 'codigo', 'i18n_common_code', '100px', null),
            new DataTableHeader(1, 'descripcion', 'i18n_common_description', '200px', null),
        ];
    }

    /**
     * Implementación de renderizado de formulario de edición y detalle. Pensado para implementar.
     * 
     * @param {boolean} isInDetailMode Si true se mostrarán todos los campos deshabilitados.
     *  
     * @returns Componente visual de formulario de edición/detalle.
     */
    renderDetailEditForm(isInDetailMode: boolean = false) {
        const code_validators: Array<string> = [
            ViewValidators.CODE_VALIDATOR, ViewValidators.IS_NUMERIC_VALIDATOR
        ];

        return (
            <div>
                <MyInput
                    id={this.id + "_codigo"}
                    entity={this.selectedItem}
                    valueName="codigo"
                    label={<FormattedMessage id="i18n_common_code" />}
                    maxLength={4}
                    isEditing={!isInDetailMode}
                    isRequired={true}
                    validation={() => this.validateEntity(this.selectedItem, "codigo", code_validators)} />

                <MyInput
                    id={this.id + "_descripcion"}
                    entity={this.selectedItem}
                    valueName="descripcion"
                    label={<FormattedMessage id="i18n_common_description" />}
                    maxLength={50}
                    isEditing={!isInDetailMode}
                    isRequired={true} />
            </div>
        );
    }

}