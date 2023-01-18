import React from 'react';
import { generateUuid } from '../utils/helper-utils'

import { ViewStates, ModalHelper } from "../utils/helper-utils";

import DataTable from '../components/data-table';
import Paginator from '../components/paginator';
import ImageButton from '../components/image-button';
import LoadingIndicator from '../components/loading-indicator';
import Modal from "../components/modal";
import { CoreController, ICoreControllerProps } from './core-controller';

import { OrderByClause, OrderByTypes } from '../utils/dao-utils';
import DataTableHeader from "./table-header";

import { FormattedMessage } from "react-intl";

import "./../components/styles/buttons.css";
import BaseEntity from "../model/base_entity";
import { toast } from 'react-hot-toast';


/**
 * @class Controlador de vista.
 */
export default abstract class ViewController<T extends BaseEntity> extends CoreController<T> {

    // DEFINICIÓN DE CAMPOS
    /**
     * Referencia a tabla de datos para poder actualizarla desde el controlador.
     */
    dataTable: React.LegacyRef<DataTable>
    /**
     * Nombre del campo id.
     */
    id_field_name: string;
    /**
     * Id del controller.
     */
    id: string;
    /**
     * Índice del modal en caso de que sea un controlador modal.
     */
    modal_index: number | null;
    /**
     * Es controlador modal.
     */
    is_modal: boolean;
    /**
     * Elemento en el que se ha de hacer el último foco.
     */
    last_focus_element: string | null;
    /**
     * Clave i18n para título del controlador.
     */
    view_title: string;
    /**
     * Lo utilizo porque los componentes de React pueden llegar a montarse varias veces; con esto evito que llame más de una vez a la API durante la carga inicial.
     */
    isAlreadyMounted: boolean;
    /**
     * Número de registros en un momento dado de acuerdo con las cláusulas del controlador.
     */
    rowNumber: number;

    /**
     * Crea una instancia del controlador de vista.
     * 
     * @param {props} 
     */
    constructor(props: ICoreControllerProps) {
        super(props);
        this.dataTable = React.createRef();
        this.id_field_name = 'id';
        this.view_title = '';
        this.table_name = '';
        this.id = generateUuid();
        this.modal_index = props.modal_index !== undefined && props.modal_index !== null ? props.modal_index : null;
        /**
         * Si tiene índice de modal, es un controlador modal.
         */
        this.is_modal = this.modal_index !== null ? true : false;
        this.last_focus_element = null;

        this.isAlreadyMounted = false;

        this.rowNumber = 0;

        // Establecer estado para atributos de lectura/escritura.
        this.state = {
            items: [],
            viewState: ViewStates.LIST,
            modalList: []
        };
    }

    /**
     * Sobrescritura de componentDidMount de React.component, para que al cargar el componente en la vista por primera vez traiga los datos desde la API.
     */
    componentDidMount() {
        // Traer datos de la API. Utilizo un flag booleano porque a veces esta función se llama un par de veces, es una característica de React.
        // Así evito llamar a la API más veces de las necesarias.
        if (!this.isAlreadyMounted) {
            this.goToList();
            this.isAlreadyMounted = true;
        }
    }

    /**
     * Sobrescritura de componentDidUpdate para poner el foco en el primer input de texto posible. Debe hacerse aquí, no se puede poner en el render 
     * porque querySelector sólo funciona en componentes ya montados en el DOM y por tanto sólo pueden llamarse en funciones del ciclo de vida del componente.
     */
    componentDidUpdate() {
        // Buscar todos los inputs de tipo texto no deshabilitados
        let focusable: HTMLElement | null = null;
        let focusable_list: NodeListOf<HTMLElement> | null = null;

        // Si es modal y no encuentra input text, que ponga el foco incluso en los botones no deshabilitados
        if (this.last_focus_element !== undefined && this.last_focus_element !== null) {
            focusable = document.getElementById(this.last_focus_element);
        } else {
            var element_focus = document.getElementById(this.props.parentContainer);

            if (element_focus !== undefined && element_focus !== null) {
                if (this.is_modal === true) {
                    focusable_list = element_focus.querySelectorAll('button:not(:disabled), input[type="text"]:not(:disabled):not([readonly]):not([type=hidden]');
                } else {
                    focusable_list = element_focus.querySelectorAll('input[type="text"]:not(:disabled):not([readonly]):not([type=hidden]');
                }
            }
        }

        // Establecer el foco en el primero que haya encontrado.
        if (focusable_list !== undefined && focusable_list !== null && focusable_list.length > 0) {
            focusable = focusable_list[0];
        }

        // Establecer el foco en el primero que haya encontrado.
        if (focusable !== undefined && focusable !== null) {
            focusable.focus();
            // Que sólo haga select si es un input text
            if (focusable.getAttribute !== undefined && focusable.getAttribute('type') === 'text') {
                var focusable_input = focusable as HTMLInputElement;
                focusable_input.select();
            }
        }

        // Al final siempre vuelvo null el elemento de foco
        this.last_focus_element = null;
    }

    /**
     * Añade un nuevo modal a la lista del controlador. Actualiza el estado del controlador de vista.
     * 
     * @param {string} title 
     * @param {any} content 
     * @param {string} width 
     */
    addModal = (title: string, content: React.ReactNode, width?: string | null): void => {
        // Copio la lista de modales
        const modalList = this.state.modalList.slice();

        // Id del modal
        const modalUuid = "modalPanel$$" + generateUuid();

        // Ancho del modal
        const modal_width = width !== undefined && width !== null ? width : '500px';

        // Contenedor padre: será el panel de la pestaña del viewcontroller si es el primer modal de la lista, 
        // o bien el panel modal del último elemento si la lista ya tiene contenido
        const parentContainer = modalList.length === 0 ? this.props.parentContainer : modalList[modalList.length - 1].id;

        // Añadir a la lista de modales
        if (parentContainer !== undefined) {
            modalList.push(new ModalHelper(title, modalUuid, parentContainer, content, modal_width));
            // Actualizo el estado del controlador
            this.setState({ modalList: modalList });
        }
    }

    /**
     * Elimina un modal del listado del controlador de vista.
     * 
     * @param {int} modalIndex 
     */
    removeModal = (modalIndex: number): void => {
        // Copio la lista de modales
        const modalList = this.state.modalList.slice();

        if (modalList !== undefined && modalList !== null && modalIndex > -1) {
            modalList.splice(modalIndex, 1);
        }

        // Actualizo el estado del controlador
        this.setState({ modalList: modalList });
    }

    /**
     * Cierra el último modal abierto de la lista del controlador.
     * 
     * @returns 
     */
    removeLastModal = (): void => {
        if (this.state.modalList !== undefined && this.state.modalList !== null && this.state.modalList.length > 0) {
            this.removeModal(this.state.modalList.length - 1);
        } else {
            return;
        }
    }

    /**
     * Función de preparado de borrado de elementos de la tabla.
     * 
     * @param {entityClass} Elemento a eliminar. 
     */
    confirmDeleteItem = (elementToDelete: T): void => {
        // Le añado un nuevo modal
        const modalContent =
            <div
                style={{
                    width: "100%",
                    height: "100",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >

                <div style={{ padding: '0px 20px' }}>
                    <span><FormattedMessage id="i18n_common_delete_item" /></span>
                </div>

                <div>
                    <button className='flat-button' onClick={() => {
                        this.deleteItem(elementToDelete);
                        this.removeModal(this.state.modalList.length - 1);
                    }}><FormattedMessage id="i18n_common_yes" /></button>

                    <button className='flat-button' style={{ marginLeft: '10px' }} onClick={() =>
                        this.removeModal(this.state.modalList.length - 1)
                    }><FormattedMessage id="i18n_common_no" /></button>
                </div>

            </div>

        // Añadir modal y actualizar estado
        this.addModal("i18n_common_confirm", modalContent);
    }

    /**
     * Selecciona un ítem para el detalle.
     * 
     * @param {entity_class} elementToSelect 
     */
    prepareDetail = (elementToSelect: T) => {
        this.loadItem(elementToSelect, ViewStates.DETAIL);
    }

    /**
     * Selecciona un ítem para la edición.
     * 
     * @param {entity_class} elementToSelect 
     */
    prepareEdit = (elementToEdit: T) => {
        this.loadItem(elementToEdit, ViewStates.EDIT);
    }

    /**
     * Prepara una nueva instancia del elemento seleccionado para la creación.
     */
    prepareCreate(): void {
        this.selectedItem = new this.entity_class();
    }

    /**
     * Navega a la vista de creación.
     */
    goToCreateView(): void {
        // Instanciar nuevo elemento seleccionado según la clase asociada al controlador.
        this.prepareCreate();

        this.setState({
            viewState: ViewStates.EDIT
        });
    }

    /**
    * Método de renderizado de toolbar de la tabla.
    * 
    * @returns {toolbar}. 
    */
    renderToolbarList(): React.ReactNode {
        return (
            <div key={this.id + "_list_toolbar"} className='toolbar'>
                <ImageButton title='i18n_reset_order_button' className='restart-button' onClick={() => this.restartOrder()} />
                <ImageButton title='i18n_add_button' className='add-button' onClick={() => this.goToCreateView()} />
            </div>
        );
    }

    /**
     * Vuelve a la vista del listado.
     */
    goToList() {
        // Cargar datos
        // Primero hay que contar cuántos registros hay
        this.countRowsByControllerClauses().then((result) => {
            this.rowNumber = result;
        }).then(() => {
            this.fetchData(ViewStates.LIST);
        }).catch(
            (error) => toast.error(error.message)
        );
    }

    /**
     * Añade una cláusula order_by al orden del controlador, o bien modifica una existente; depende del flag de la cabecera pasada como parámetro.
     * 
     * @param {HeaderHelper} header 
     */
    add_order_by_header(header: DataTableHeader) {
        // Clono con slice la lista de order bys según el estado.
        const order_list = this.order == null ? [] : this.order.slice();

        // Busco la cláusula order_by cuyo campo se corresponda con el nombre de la cabecera, la convierto a otro estado siguiendo un
        // semáforo: si no existe pasa a ASC, si ASC pasa a DESC, y si DESC se elimina.
        var index = null;
        var exists = null;
        for (let i = 0; i < order_list.length; i++) {
            if (order_list[i].field_name === header.field_name) {
                index = i;
                break;
            }
        }

        // Si existe, cambiar el tipo de la cláusula según el flag order_state. También cambiar el estado de dicho flag para visualizar el cambio en la propia cabecera.
        if (index != null) {
            exists = order_list[index];

            if (header.order_state === 'up') {
                exists.order_by_type = OrderByTypes.DESC;
                header.order_state = 'down';
            } else {
                // Elimino del array
                order_list.splice(index, 1);
                header.order_state = null;
            }
        } else {
            // Si no existe, añadir a la lista de order_bys una nueva cláusula con ASC
            order_list.push(new OrderByClause(header.field_name, OrderByTypes.ASC));
            header.order_state = 'up';
        }

        // Modifico las cabeceras del controlador también
        if (this.headers) {
            for (let i = 0; i < this.headers.length; i++) {
                if (this.headers[i].field_name === header.field_name) {
                    this.headers[i] = header;
                    break;
                }
            }
        }

        // Reasigno el orden del viewcontroller
        this.order = order_list;

        // Llamo a fetchdata para rehacer el estado del viewcontroller y de la tabla interior.
        this.fetchData();
    }

    /**
     * Reestablece el orden por defecto.
     */
    restartOrder() {
        // Reestablecer cabeceras
        // Modifico las cabeceras del controlador también
        if (this.headers) {
            for (let i = 0; i < this.headers.length; i++) {
                this.headers[i].order_state = null;
            }
        }

        // Traer datos de nuevo quitando el orden
        this.order = [];
        this.fetchData();
    }

    // PAGINACIÓN
    /**
     * Devuelve el número de páginas disponibles de acuerdo con el número de registros y el límite de los mismos por página.
     * 
     * @returns number
     */
    protected calculateNumberOfPages(): number {
        return Math.ceil(this.rowNumber / this.rowLimit);
    }

    /**
     * Muestra la primera página de la tabla.
     */
    goToFirstPage = () => {
        this.rowOffset = 0;
        this.fetchData();
    }

    /**
     * Muestra la página anterior de la tabla.
     */
    goToPreviousPage = () => {
        this.rowOffset = this.rowOffset - this.rowLimit;
        
        if (this.rowOffset < 0) {
            this.rowOffset = 0;
        }

        this.fetchData();
    }

    /**
     * Muestra la siguiente página de la tabla.
     */
    goToNextPage = () => {
        // El siguiente offset será el anterior más el límite de filas
        this.rowOffset = this.rowOffset + this.rowLimit;

        // Si el offset supera el número total de filas, he llegado a la última página
        if (this.rowOffset > this.rowNumber) {
            this.goToLastPage();
        } else {
            this.fetchData();
        }
    }

    /**
     * Muestra la última página de la tabla.
     */
    goToLastPage = () => {
        // En la última página, el offset será el número de páginas menos uno multiplicado por el límite de filas
        // Si tengo cinco registros mostrando dos registros por página, tendré tres páginas (número de filas totales entre límite de filas redondeado hacia arriba)
        // El offset de la última página será el cuatro: (página 3 -1) * 2
        this.rowOffset = (this.calculateNumberOfPages() - 1) * this.rowLimit;
        this.fetchData();
    }

    // RENDERIZADO DEL COMPONENTE
    /**
    * Método de renderizado de toolbar de la tabla.
    * 
    * @returns Toolbar. 
    */
    renderToolbarEditDetail(): React.ReactNode {
        // Si estamos en modo detalle, se mostrará un botón para editar el objeto; si estamos en modo edición, se mostrará el botón de guardar.
        const editSaveButton: React.ReactNode = this.isInDetailMode() ?
            <ImageButton title='i18n_edit_button' className='edit-button' type='button' onClick={() => this.selectedItem !== null ? this.prepareEdit(this.selectedItem) : null} /> :
            <ImageButton title='i18n_save_button' className='save-button' type='submit' />;

        // Le paso una key generada aleatoriamente porque este componente se va a repintar dentro de la misma vista, así fuerzo a que todos los hijos
        // se repinten completamente. Si no lo hago, los botones podrían no funcionar bien a pesar de estar aparentemente bien renderizados.
        const toolbar_id = this.isInDetailMode() ? this.id + "_detail_toolbar" : this.id + "_edit_toolbar";
        return (
            <div className='toolbar' key={toolbar_id}>
                <ImageButton title='i18n_back_button' className='back-button' onClick={(e) => { e.preventDefault(); this.goToList(); }} />
                {editSaveButton}
            </div>
        );
    }

    /**
     * Renderizado de la vista de tabla o listado.
     * 
     * @returns Componente visual de tabla o listado. 
     */
    renderTableView(): React.ReactNode {
        const { items } = this.state;
        const view_title = this.view_title;

        // TOOLBAR
        const toolbar = this.renderToolbarList();

        // Las acciones dependen de si el controlador es modal o no
        let select_action;
        if (this.is_modal === true) {
            select_action = this.props.select_action;
        } else {
            select_action = this.prepareDetail;
        }

        return (
            <div key={this.id + "_table_view"}>
                <h3 style={{ marginBottom: '15px', textTransform: 'uppercase' }}><FormattedMessage id={view_title} /></h3>

                {toolbar}

                <DataTable ref={this.dataTable} headers={this.headers} data={items} id_field_name={this.id_field_name}
                    onHeaderOrderClick={(h) => this.add_order_by_header(h)} table_name={this.table_name}
                    deleteAction={this.confirmDeleteItem} selectAction={select_action} editAction={this.prepareEdit} />

                <Paginator firstPageAction={this.goToFirstPage} previousPageAction={this.goToPreviousPage}
                    nextPageAction={this.goToNextPage} lastPageAction={this.goToLastPage} />
            </div>
        );
    }

    /**
     * Implementación de renderizado de formulario de edición y detalle. Está pensado para sobrescribir en cada implementación de ViewController.
     * 
     * @param {boolean} isInDetailMode Si true se mostrarán todos los campos deshabilitados.
     *  
     * @returns Componente visual de formulario de edición/detalle.
     */
    renderDetailEditForm(isInDetailMode = false): React.ReactNode | null {
        return null;
    }

    /**
     * Devuelve true si el controlador de vista está en modo detalle.
     * 
     * @returns {boolean}
     */
    isInDetailMode(): boolean {
        const { viewState } = this.state;
        return (viewState !== null && viewState !== undefined && viewState === ViewStates.DETAIL);
    }

    /**
     * Renderizado de la vista de edición.
     * 
     * @returns {Component} Componente visual de edición. 
     */
    renderEditView(): React.ReactNode | null {
        const view_title = this.view_title;

        const editDetailForm = this.renderDetailEditForm(this.isInDetailMode());

        // Toolbar
        const toolbar = this.renderToolbarEditDetail();

        return (
            <div key={this.id + "_edit_view"}>
                <h3 style={{ marginBottom: '15px', textTransform: 'uppercase' }}><FormattedMessage id={view_title} /></h3>

                <form method="POST" action="/" onSubmit={(e) => this.saveChanges(e)}>

                    {toolbar}

                    <div style={{ marginTop: '10px', padding: '10px 5px 10px 5px', backgroundColor: 'white', width: '99%', float: 'left' }}>
                        {editDetailForm}
                    </div>

                </form>
            </div>
        );
    }

    /**
     * Implementación del renderizado.
     * 
     * @returns {Component} Formulario del mantenimiento.
     */
    render() {
        // La vista a renderizar depende del estado de este atributo.
        const { viewState, modalList } = this.state;

        let selectedView;

        switch (viewState) {
            case ViewStates.LIST:
                selectedView = this.renderTableView();
                break;
            case ViewStates.EDIT:
            case ViewStates.DETAIL:
                selectedView = this.renderEditView();
                break;
            default:
                selectedView = null;
                break;
        }

        // Cargamos el waitStatus, la vista seleccionada y la lista de modalPanels
        return (
            <div>
                <LoadingIndicator parentContainer={this.props.parentContainer} />

                {selectedView}

                {modalList.map((step, i) => {
                    return <Modal title={<FormattedMessage id={step.title} />}
                        id={step.id} key={step.id} index={i} onClose={() => this.removeModal(i)}
                        parentContainer={step.parentContainer} width={step.modal_width}>{step.content}</Modal>
                })}
            </div>
        );

    }

}