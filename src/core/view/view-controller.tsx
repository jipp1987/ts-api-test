import React from 'react';
import { generateUuid } from '../utils/helper-utils'

import {
    ViewStates, ModalHelper, delete_from_localStorage_by_tab, SAVE_DELIMITER, SAVE_SEPARATOR, TAB_SAVE_SEPARATOR,
    MODAL_SAVE_SEPARATOR, PROPERTY_SAVE_SEPARATOR, STATE_SAVE_SEPARATOR, TAB_TO_DELETE, get_property_value_by_name
} from "../utils/helper-utils";

import DataTable from '../components/data-table';
import ImageButton from '../components/image-button';
import LoadingIndicator from '../components/loading-indicator';
import Modal from "../components/modal";
import { CoreController, ICoreControllerProps } from './core-controller';

import { FormattedMessage } from "react-intl";

import "./../components/styles/buttons.css";
import { FieldClause, FilterClause, GroupByClause, JoinClause, OrderByClause } from '../utils/dao-utils';
import BaseEntity from "../model/base_entity";
import DataTableHeader from './table-header';


/**
 * @class Controlador de vista.
 */
export default class ViewController<T extends BaseEntity> extends CoreController<T> {

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
     * Límite de filas en la tabla.
     */
    rowLimit: number;
    /**
     * Clave i18n para título del controlador.
     */
    view_title: string;
    /**
     * Crea una instancia del controlador de vista.
     * 
     * @param {props} 
     */
    constructor(props: ICoreControllerProps) {
        super(props);
        this.dataTable = React.createRef();
        this.rowLimit = 50;
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

        // Establecer estado para atributos de lectura/escritura.
        this.state = {
            /**
             * Lista de datos para mostrar en la tabla.
             */
            items: [],

            /**
             * Estado del controlador de vista. Por defecto navegar a la vista de listado.
             */
            viewState: ViewStates.LIST,

            /**
             * Lista de paneles modales abiertos en el controlador.
             */
            modalList: []
        };
    }

    /**
     * Función para almecenar los datos del viewcontroller en almacenamiento local.
     */
    saveStateToLocalStorage() {
        // Para almacenar la variable con localStorage, he de tener en cuenta tres cosas:
        // 1. Pestaña del controlador
        // 2. Modal (el controlador puede estar en un modal o en la ventana principal, pero si está en un modal hay que registrarlo)
        // 3. Si es una propiedad del objeto o bien pertenece al estado del mismo

        // TODO De momento no voy a guardar en localStorage los modales, pero si en algún momento lo hago es importante borrar de localstorage al cerrar el modal!!!
        if (this.is_modal) {
            return;
        }

        var k = TAB_SAVE_SEPARATOR + SAVE_SEPARATOR + this.props.tab + (this.is_modal ? SAVE_DELIMITER + MODAL_SAVE_SEPARATOR + SAVE_SEPARATOR + this.modal_index : "") + SAVE_DELIMITER + PROPERTY_SAVE_SEPARATOR + SAVE_SEPARATOR;

        localStorage.setItem(k + "fields", JSON.stringify(this.fields));
        localStorage.setItem(k + "filters", JSON.stringify(this.filters));
        localStorage.setItem(k + "order", JSON.stringify(this.order));
        localStorage.setItem(k + "joins", JSON.stringify(this.joins));
        localStorage.setItem(k + "group_by", JSON.stringify(this.group_by));
        localStorage.setItem(k + "headers", JSON.stringify(this.headers));
        localStorage.setItem(k + "selectedItem", JSON.stringify(this.selectedItem));
        localStorage.setItem(k + "itemToDelete", JSON.stringify(this.itemToDelete));
        localStorage.setItem(k + "rowLimit", this.rowLimit.toString());

        if (this.last_focus_element !== null && this.last_focus_element !== "") {
            localStorage.setItem(k + "last_focus_element", this.last_focus_element);
        }

        // Guardo aparte el estado
        k = TAB_SAVE_SEPARATOR + SAVE_SEPARATOR + this.props.tab + (this.is_modal ? SAVE_DELIMITER + MODAL_SAVE_SEPARATOR + SAVE_SEPARATOR + this.modal_index : "") + SAVE_DELIMITER + STATE_SAVE_SEPARATOR + SAVE_SEPARATOR;
        localStorage.setItem(k + "viewState", this.state.viewState);
        // localStorage.setItem(k + "modalList", JSON.stringify(this.state.modalList));
    }

    /**
     * Restaura el estado desde localStore.
     */
    restoreStateFromLocalStore() {
        // Recorrer lista de propiedades del objeto y a partir de localStorage ir completando datos
        let key: string | null;
        let value: any;
        // La clave está formada por una serie de tokens los cuáles me van a informar sobre si la propiedad pertenece o no al controlador
        let key_split;
        let field_token;
        let field_name;

        // Voy recorriendo localStore y estableciendo valores
        for (let i = 0; i < localStorage.length; i++) {
            key = localStorage.key(i);

            if (key === null) {
                continue;
            }

            value = localStorage[key];

            // Hago un split por el delimitador de cada idenficador
            key_split = key.split(SAVE_DELIMITER);

            // Tengo que comprobar que la pestaña (y el modal, si el controlador es modal) coinciden para no volcar los datos en el controller equivocado.
            if (!key_split.includes(TAB_SAVE_SEPARATOR + SAVE_SEPARATOR + this.props.tab)) {
                continue;
            }

            // Lo mismo para controllers de modal, siempre y cuando lo sea
            if (this.is_modal && !key_split.includes(MODAL_SAVE_SEPARATOR + SAVE_SEPARATOR + this.props.modal_index)) {
                continue;
            }

            // Si llega hasta aquí, es que la propiedad es del controlador

            // El último valor siempre es el nombre del campo
            field_token = key_split[key_split.length - 1];
            field_name = field_token.split(SAVE_SEPARATOR)[1];

            // Finalmente, tengo que revisar campo por campo para establecerlos correctamente desde json
            switch (field_name) {
                case 'viewState':
                    // Atributo de estado
                    this.setState({ viewState: get_property_value_by_name(ViewStates, value) });
                    break;

                case 'rowLimit':
                    // Caso para números enteros
                    this.rowLimit = parseInt(value);
                    break;

                case 'fields':
                    this.fields = [];

                    if (value !== undefined && value !== null) {
                        value = JSON.parse(value);

                        if (value !== null) {
                            for (let i = 0; i < value.length; i++) {
                                this.fields.push(FieldClause.fromJSON(value[i]));
                            }
                        }
                    }

                    break;

                case 'filters':
                    this.filters = [];

                    if (value !== undefined && value !== null) {
                        value = JSON.parse(value);

                        if (value !== null) {
                            for (let i = 0; i < value.length; i++) {
                                this.filters.push(FilterClause.fromJSON(value[i]));
                            }
                        }
                    }

                    break;

                case 'order':
                    this.order = [];

                    if (value !== undefined && value !== null) {
                        value = JSON.parse(value);

                        if (value !== null) {
                            for (let i = 0; i < value.length; i++) {
                                this.order.push(OrderByClause.fromJSON(value[i]));
                            }
                        }
                    }

                    break;

                case 'joins':
                    this.joins = [];

                    if (value !== undefined && value !== null) {
                        value = JSON.parse(value);

                        if (value !== null) {
                            for (let i = 0; i < value.length; i++) {
                                this.joins.push(JoinClause.fromJSON(value[i]));
                            }
                        }
                    }

                    break;

                case 'group_by':
                    this.group_by = [];

                    if (value !== undefined && value !== null) {
                        value = JSON.parse(value);

                        if (value !== null) {
                            for (let i = 0; i < value.length; i++) {
                                this.group_by.push(GroupByClause.fromJSON(value[i]));
                            }
                        }
                    }

                    break;

                case 'headers':
                    this.headers = [];

                    if (value !== undefined && value !== null) {
                        value = JSON.parse(value);

                        if (value !== null) {
                            for (let i = 0; i < value.length; i++) {
                                console.log(value[i]);
                                this.headers.push(DataTableHeader.fromJSON(value[i]));
                            }
                        }
                    }

                    break;

                case 'selectedItem':
                    this.selectedItem = value !== undefined && value !== null ? this.entity_class.from(JSON.parse(value)) : null;
                    break;

                case 'itemToDelete':
                    this.itemToDelete = value !== undefined && value !== null ? this.entity_class.from(JSON.parse(value)) : null;
                    break;

                default:
                    // Caso genérico para strings
                    var newValues = {
                        field_name: value,
                    }
                    Object.assign(this, newValues);
                    break;
            }
        }
    }

    /**
     * Sobrescritura de componentDidMount de React.component, para que al cargar el componente en la vista por primera vez traiga los datos desde la API.
     */
    componentDidMount() {
        // Restaurar estado y propiedades de la vista desde localStore
        // this.restoreStateFromLocalStore();

        // Traer datos de la API
        this.fetchData();

        // Eliminar los datos del controlador del localStorage después de montar el componente
        // delete_from_localStorage_by_tab(this.props.tab);

        // Añade listener para guardar el estado en localStorage cuando el usuario abandona o refresca la página
        // window.addEventListener(
        //     "beforeunload",
        //     this.saveStateToLocalStorage.bind(this)
        // );

        // window.addEventListener(
        //     "beforeunload",
        //     this.restoreStateFromLocalStore.bind(this)
        // );
    }

    /**
     * Sobrescritura de componentWillUnmount para guardar los datos en localStorage al recargar la página. 
     */
    componentWillUnmount() {
        // Guarda el estado pero sólo si el componente se desmonta sin haberse cerrado la pestaña (es decir, si se ha recargado la página).
        // La función de cerrado de pestaña se lanza antes de desmontar el componente.
        /*
        if (localStorage.getItem(TAB_TO_DELETE + SAVE_SEPARATOR + this.props.tab)) {
            // Eliminar los datos del controlador del localStorage después de montar el componente
            delete_from_localStorage_by_tab(this.props.tab);
            // Si se ha cerrado la pestaña, no guardo los datos. Sí que elimino esta clave para evitar problemas.
            localStorage.removeItem(TAB_TO_DELETE + SAVE_SEPARATOR + this.props.tab);
        } else {
            this.saveStateToLocalStorage();
        }

        // Eliminar el listener definido en componentDidMount
        window.removeEventListener(
            "beforeunload",
            this.saveStateToLocalStorage.bind(this)
        );

        window.removeEventListener(
            "beforeunload",
            this.restoreStateFromLocalStore.bind(this)
        );
        */
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
    prepareDetail = (elementToSelect: T): void => {
        this.selectedItem = elementToSelect;

        // Cambiar estado.
        this.setState({
            viewState: ViewStates.DETAIL
        });
    }

    /**
     * Selecciona un ítem para la edición.
     * 
     * @param {entity_class} elementToSelect 
     */
    prepareEdit = (elementToEdit: T): void => {
        this.selectedItem = elementToEdit;

        // Cambiar estado.
        this.setState({
            viewState: ViewStates.EDIT
        });
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
            <div className='toolbar'>
                <ImageButton title='i18n_reset_order_button' className='restart-button' onClick={() => this.restartOrder()} />
                <ImageButton title='i18n_add_button' className='add-button' onClick={() => this.goToCreateView()} />
            </div>
        );
    }

    /**
     * Vuelve a la vista del listado.
     */
    goToList(): void {
        // Cargar datos
        this.fetchData();

        // Cambiar estado.
        this.setState({
            viewState: ViewStates.LIST
        });
    }

    /**
    * Método de renderizado de toolbar de la tabla.
    * 
    * @returns Toolbar. 
    */
    renderToolbarEditDetail(): React.ReactNode {
        return (
            <div className='toolbar'>
                <ImageButton title='i18n_back_button' className='back-button' onClick={(e) => { e.preventDefault(); this.goToList(); }} />
                <ImageButton title='i18n_save_button' className='save-button' type='submit' />
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
            <div>
                <h3 style={{ marginBottom: '15px', textTransform: 'uppercase' }}><FormattedMessage id={view_title} /></h3>

                {toolbar}

                <DataTable ref={this.dataTable} headers={this.headers} data={items} id_field_name={this.id_field_name}
                    onHeaderOrderClick={(h) => this.add_order_by_header(h)} table_name={this.table_name}
                    deleteAction={this.confirmDeleteItem} selectAction={select_action} editAction={this.prepareEdit} />
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
            <div>
                <h3 style={{ marginBottom: '15px', textTransform: 'uppercase' }}><FormattedMessage id={view_title} /></h3>

                <form method="POST" action="/" onSubmit={(e) => this.saveChanges(e)}>

                    {toolbar}

                    <div style={{ marginTop: '10px' }}>
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