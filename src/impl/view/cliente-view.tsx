import React from 'react';

import DataTableHeader from '../../core/view/table-header';
import { FieldClause, JoinClause, JoinTypes } from '../../core/utils/dao-utils';
import ViewController from '../../core/view/view-controller';
import { ICoreControllerProps } from '../../core/view/core-controller';
import Cliente from '../model/cliente';
import TipoCliente from '../model/tipo_cliente';

import { generateUuid, ViewValidators } from './../../core/utils/helper-utils';
import { VIEW_MAP } from './view_map';

import { FormattedMessage } from "react-intl";
import InputText from './../../core/components/input-text';
import SuggestionBox from './../../core/components/suggestion-box';

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
            new FieldClause("codigo", null),
            new FieldClause("nombre", null),
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
        ];
    }

    /**
    * Sobrescritura. Prepara una nueva instancia del elemento seleccionado para la creación.
    */
    prepareCreate() {
        this.selectedItem = new Cliente();
        this.selectedItem.tipo_cliente = new TipoCliente();
    }

    // TODO Provisional.
    /**
     * Establece el tipo de cliente.
     * @param {*} tipo_cliente 
     */
    setTipoCliente = (tipo_cliente: TipoCliente) => {
        // Modificar la entidad. El suggestionbox ya tiene un hook para repintarse en caso de que se modifique su entidad asociada.
        if (this.selectedItem !== null) {
            this.selectedItem.tipo_cliente = tipo_cliente;
            // Forzar foco sobre el input al finalizar la operación
            this.last_focus_element = this.id + "_tipoCliente";
        }
    }

    // TODO Provisional.
    /**
     * Función de preparado de borrado de elementos de la tabla.
     */
    openTipoClienteModal = () => {
        // Le añado un nuevo modal
        const LazyComponent = require('src/' + VIEW_MAP['TipoClienteView']).default;

        // OJO!!! NO confundir con el parentContainer del propio modal, que es el div sobre el que se va a abrir. Esto es el contenedor del controlador del modal,
        // y es un div interno del mismo. Lo necesito sobre todo para hacer focus y cosas así.
        const modalId = generateUuid();

        // Índice que va a ocupar en el modal tras añadirlo: será el tamaño actual del listado de modales antes de añadir el nuevo.
        const modal_index = this.state.modalList !== undefined && this.state.modalList !== null ? this.state.modalList.length : 0;

        const modalContent = <div id={'modalDiv$$' + modalId} style={{ width: '100%' }}>
            <LazyComponent key={modalId} tab={this.props.tab} parentContainer={'modalDiv$$' + modalId} modal_index={modal_index}
                select_action={(d: TipoCliente) => { this.setTipoCliente(d); this.removeLastModal(); }} />
        </div>;

        // Añadir modal y actualizar estado
        this.addModal("i18n_tipos_cliente_title", modalContent, '800px');
    }

    /**
    * Implementación de renderizado de formulario de edición y detalle. Pensado para implementar.
    * 
    * @param {boolean} isInDetailMode Si true se mostrarán todos los campos deshabilitados.
    *  
    * @returns Componente visual de formulario de edición/detalle.
    */
    renderDetailEditForm(isInDetailMode = false) {
        if (this.selectedItem !== null) {
            return (
                <div>

                    <InputText
                        id={this.id + "_codigo"}
                        entity={this.selectedItem}
                        valueName="codigo"
                        label={<FormattedMessage id="i18n_common_code" />}
                        maxLength={10}
                        isEditing={!isInDetailMode}
                        isRequired={true}
                        validation={() => this.validateEntity(this.selectedItem, "codigo", [ViewValidators.CODE_VALIDATOR, ViewValidators.IS_NUMERIC_VALIDATOR])} />

                    <InputText
                        id={this.id + "_nombre"}
                        entity={this.selectedItem}
                        valueName="nombre"
                        label={<FormattedMessage id="i18n_common_first_name" />}
                        maxLength={50}
                        isEditing={!isInDetailMode}
                        isRequired={true} />

                    <InputText
                        id={this.id + "_apellidos"}
                        entity={this.selectedItem}
                        valueName="apellidos"
                        label={<FormattedMessage id="i18n_common_last_name" />}
                        maxLength={80}
                        isEditing={!isInDetailMode}
                        isRequired={false} />

                    <InputText
                        id={this.id + "_saldo"}
                        entity={this.selectedItem}
                        valueName="saldo"
                        label={<FormattedMessage id="i18n_clientes_saldo" />}
                        maxLength={10}
                        size={15}
                        isFloat={true}
                        isEditing={!isInDetailMode}
                        isRequired={true} />

                    <SuggestionBox
                        id={this.id + "_tipoCliente"}
                        entity={this.selectedItem.tipo_cliente}
                        valueName={TipoCliente.getCodigoFieldName()}
                        idFieldName={TipoCliente.getIdFieldName()}
                        suggestAction={(inputText) => this.suggestEntities(inputText,
                            ['codigo', 'descripcion'], ['codigo', 'descripcion'], 'id', "TipoCliente")}
                        label={<FormattedMessage id="i18n_clientes_customer_type" />}
                        maxLength={4}
                        isEditing={!isInDetailMode}
                        isRequired={true}
                        findAction={() => this.openTipoClienteModal()} />

                </div>
            );
        } else {
            return null;
        }
    }

}