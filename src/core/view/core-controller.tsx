import React from 'react';

import { FilterClause, FilterTypes, FieldClause, OperatorTypes, OrderByClause, JoinClause, GroupByClause } from '../utils/dao-utils';
import { ViewStates, ViewValidators, get_property_value_by_name, ModalHelper } from "../utils/helper-utils";
import { getRequestOptionsForAPICall, callAPI, refreshToken, TOKEN_SESSION_ID } from "../utils/api-utils";
import { VALIDATION_FUNCTION_TYPE } from "./validation-utils";
import DataTableHeader from "./table-header";
import BaseEntity from "./../model/base_entity";

import { trackPromise } from 'react-promise-tracker';
import { FormattedMessage } from "react-intl";

import toast from 'react-hot-toast';

import { properties } from '../utils/db-properties';

import "./../components/styles/buttons.css";


export interface ICoreControllerProps {
    tab: number;
    parentContainer: string;
    modal_index?: number | null;
    select_action?(params?: any): any;
}

export interface ICoreControllerState {
    /**
     * Estado de la vista.
     */
    viewState: string;
    /**
     * Elementos cargados desde la base de datos en la consulta de la tabla.
     */
    items: Array<BaseEntity>;
    /**
     * Array de modales.
     */
    modalList: Array<ModalHelper>;
}

/**
 * @class Core de controladores de vista.
 */
export abstract class CoreController<T extends BaseEntity, I extends ICoreControllerState> extends React.Component<ICoreControllerProps, I> {

    // ATRIBUTOS DE CLASE
    /**
     * Límite de filas.
     */
    rowLimit: number;

    /**
     * Valor para paginación de la tabla.
     */
    rowOffset: number;

    /**
     * Campos para la SELECT.
     */
    fields: Array<FieldClause> | null;

    /**
     * Filtros activos.
     */
    filters: Array<FilterClause> | null;

    /**
     * OrderBys activos.
     */
    order: Array<OrderByClause> | null;

    /**
     * Nombre de la tabla.
     */
    table_name: string;

    /**
     * Joins activos.
     */
    joins: Array<JoinClause> | null;

    /**
     * Group bys activos.
     */
    group_by: Array<GroupByClause> | null;

    /**
     * Array de objetos DataTableHeader para modelar las cabeceras.
     */
    headers: Array<DataTableHeader>;

    /**
     * Elemento seleccionado para eliminación.
     */
    selectedItem: T | null;

    /**
     * Elemento seleccionado para eliminación.
     */
    itemToDelete: T | null;

    /**
     * Tipo de la entidad principal
     */
    entity_class: any;

    /**
     * Crea una instancia del controlador de vista.
     * 
     * @param {props} 
     */
    constructor(props: ICoreControllerProps) {
        super(props);

        this.rowLimit = 50;
        this.rowOffset = 0;
        this.fields = null;
        this.table_name = "";
        this.filters = null;
        this.order = null;
        this.joins = null;
        this.group_by = null;
        this.headers = [];
        this.selectedItem = null;
        this.itemToDelete = null;
    }

    /**
     * Devuelve el valor del campo id del elemento seleccionado.
     * 
     * @returns string | null
     */
    protected getSelectedItemIdFieldValue(): string | null {
        // Si el objeto tiene id, es una actualización 
        const field_id_name = this.entity_class.getIdFieldName();
        const field_id = get_property_value_by_name(this.selectedItem, field_id_name);
        const id = field_id !== undefined && field_id !== null ? field_id : null;

        return id;
    }

    /**
     * Comprueba si la entidad seleccionada tiene id (significa que ha existe en la base de datos).
     * 
     * @returns boolean 
     */
    public doesSelectedEntityHaveId(): boolean {
        if (this.selectedItem !== null) {
            const id = this.getSelectedItemIdFieldValue();
            if (id !== null) {
                return true;
            } else {
                return false;
            }
        } else {
            throw Error("$$No entity");
        }
    }

    /**
    * Convierte un array json a un array de entidades del modelo de datos.
    * 
    * @param {json} json_result 
    * @returns {List} Lista de entidades según el modelo de datos correspondiente a la vista. 
    */
    protected convertFromJsonToEntityList(json_result: Array<string>): Array<T> {
        var result = [];

        // Convertir entidad a entidad.
        if (json_result !== null && json_result.length > 0) {
            for (let i = 0; i < json_result.length; i++) {
                result.push(this.entity_class.fromJSON(json_result[i]));
            }
        }

        return result;
    }

    // MÉTODOS API
    /**
     * Devuelve las opciones para la request a la api.
     * 
     * @param {ViewStates} controllerState Estado del controlador. Si null, se utilizará el que tenga el controlador en un momento dado.
     * @param {List[FieldClause]} fields Listado de FieldClause para selects.
     * @param {List[JoinClause]} joins Listado de JoinClause para selects.
     * @param {List[FilterClause]} filters Listado de FilterClause para selects.
     * @param {List[GroupByClause]} group_by Listado de GroupByClause para selects.
     * @param {List[OrderByClause]} order Listado de OrderByClause para selects.
     * @param {number} offset
     * @param {number} limit
     * @param {target_entity} Entidad objetivo. Utiliza la del controlador si es undefined o null.
     * 
     * @returns {dict} Diccionario de requestOptions para peticiones a la API.
     */
    protected getRequestOptionsForViewState(controllerState: string | null = null, fields: Array<FieldClause> | null, joins: Array<JoinClause> | null,
        filters: Array<FilterClause> | null, group_by: Array<GroupByClause> | null,
        order: Array<OrderByClause> | null, offset: number | null, limit: number | null,
        target_entity?: string): RequestInit {
        let request_body;

        // En función del estado del viewcontroller, el body de la petición será diferente.
        var { viewState } = this.state;

        // Si se ha pasado un estado como parámetro significa que queremos forzar una consulta en concreto
        if (controllerState !== undefined && controllerState !== null) {
            viewState = controllerState;
        }

        // Si no se ha especificado la entidad objetivo, se utiliza la del propio controlador de vista. 
        if (target_entity === undefined || target_entity === null) {
            target_entity = this.table_name;
        }

        switch (viewState) {
            case ViewStates.EDIT:
            case ViewStates.DETAIL:

                if (this.selectedItem === undefined || this.selectedItem === null) {
                    throw new Error('The selected item cannot be null.')
                }

                request_body = {
                    entity: target_entity,
                    request_object: this.selectedItem.toObject()
                };

                break;

            case ViewStates.DELETE:

                if (this.itemToDelete === undefined || this.itemToDelete === null) {
                    throw new Error('The item to delete cannot be null.')
                }

                request_body = {
                    entity: target_entity,
                    request_object: this.itemToDelete.toObject()
                };

                break;

            case ViewStates.LIST:
            case ViewStates.VALIDATE:
            default:
                // Cargar parámetros de consulta.
                var fields_param: Array<any> | null = null;
                var joins_param: Array<any> | null = null;
                var filters_param: Array<any> | null = null;
                var group_by_param: Array<any> | null = null;
                var order_param: Array<any> | null = null;

                // Convierto a objeto serializable cada ítem del listado
                if (fields !== undefined && fields !== null && fields.length > 0) {
                    fields_param = [];
                    for (let i = 0; i < fields.length; i++) {
                        if (fields[i] !== undefined && fields[i] !== null) {
                            fields_param[i] = fields[i].toObject();
                        }
                    }
                }

                if (joins !== undefined && joins !== null && joins.length > 0) {
                    joins_param = [];
                    for (let i = 0; i < joins.length; i++) {
                        if (joins[i] !== undefined && joins[i] !== null) {
                            joins_param[i] = joins[i].toObject();
                        }
                    }
                }

                if (filters !== undefined && filters !== null && filters.length > 0) {
                    filters_param = [];
                    for (let i = 0; i < filters.length; i++) {
                        if (filters[i] !== undefined && filters[i] !== null) {
                            filters_param[i] = filters[i].toObject();
                        }
                    }
                }

                if (group_by !== undefined && group_by !== null && group_by.length > 0) {
                    group_by_param = [];
                    for (let i = 0; i < group_by.length; i++) {
                        if (group_by[i] !== undefined && group_by[i] !== null) {
                            group_by_param[i] = group_by[i].toObject();
                        }
                    }
                }

                if (order !== undefined && order !== null && order.length > 0) {
                    order_param = [];
                    for (let i = 0; i < order.length; i++) {
                        order_param[i] = order[i].toObject();
                    }
                }

                request_body = {
                    entity: target_entity,
                    request_object: {
                        fields: fields_param,
                        joins: joins_param,
                        filters: filters_param,
                        group_by: group_by_param,
                        order: order_param,
                        offset: offset,
                        limit: limit
                    }
                };

                break;
        }

        return this.getRequestOptionsForDBOps(request_body);
    }

    /**
     * Devuelve las opciones de la request para la API.
     * 
     * @param request_body 
     * @returns RequestInit
     */
    protected getRequestOptionsForDBOps(request_body: {}): RequestInit {
        return getRequestOptionsForAPICall("POST", sessionStorage.getItem(TOKEN_SESSION_ID), request_body);
    }

    /** Devuelve un objeto para solicitud de carga de entidad.
     * 
     * @param elementToSelect 
     * @returns request_object.
    */
    protected getRequestBodyForLoad(): {} {
        if (this.selectedItem !== null) {
            const requestBody: {} = {
                entity: this.table_name,
                request_object: { entity_id: this.selectedItem.getIdFieldValue() }
            };

            return requestBody;
        } else {
            throw Error("$$No entity");
        }
    }

    /**
     * Envía una petición a la API. 
     * 
     * @param {string} url Dirección de la API. Si null, se utiliza la url asociada al controlador. 
     * @param {RequestOptions} requestOptions Objecto de opciones para la petición.
     * @param {boolean} waitStatus Si true, mostrará un modal waitStatus.
     * @returns {Promise} Evento asíncrono que a su vez devuelve el resultado de la operación 
     * (que es un objeto RequestResponse con atributos success, status_code y response_object). Dado que devuelve una promesa, la función que llame a ésta 
     * debe emplear then para captura el return interno, es decir, el resultado.
     */
    protected async makeRequestToAPI(url: string | null, requestOptions: RequestInit, waitStatus: boolean = true): Promise<any> {
        // Refrescar el token si es necesario, no necesito esperar a que acabe la función, puede ser una tarea asíncrona paralela 
        // porque lo que hago es comprobar si queda menos de la mitad del tiempo para que caduque el token y así solicitar su refrescado.
        let proceed: boolean | undefined;
        await refreshToken().then((result: boolean) => {
            proceed = result;
        }).catch((error) => {
            throw new Error(error.message);
        });

        if (proceed !== undefined) {
            const api_url: string = url !== undefined && url !== null ? url : properties.apiUrl;
            const query: Promise<any> = callAPI(api_url, requestOptions);
            return (waitStatus ? trackPromise(query) : query);
        }
    }

    /**
     * Hace una consulta a la API para traer datos para el listado.
     * 
     * @param newViewState Cambio opcional de estado del controlador.
     */
    fetchData = async (newViewState: string | null = null): Promise<void> => {
        const request_options: RequestInit = this.getRequestOptionsForViewState(ViewStates.LIST, this.fields, this.joins, this.filters,
            this.group_by, this.order, this.rowOffset, this.rowLimit);

        const { viewState } = this.state;

        await this.makeRequestToAPI(properties.apiUrl + "/select", request_options).then((result) => {
            // Si el resultado ha sido correcto es un código 200
            if (result['status_code'] !== undefined && result['status_code'] !== null && result['status_code'] === 200) {
                this.setState({
                    items: this.convertFromJsonToEntityList(result['response_object']),
                    viewState: newViewState !== null ? newViewState : viewState
                });
            } else {
                throw new Error(result['response_object']);
            }
        }).catch(
            (error) => toast.error(error.message)
        );
    }

    /**
     * Maneja el evento de envío del objeto a la api.
     * 
     * @param {event} e Evento de javascript. 
     */
    protected async saveChanges(e: React.FormEvent<HTMLFormElement>) {
        // Prevedir el comportamiento por defecto del formulario, es decir, prevenir el submit.
        e.preventDefault();

        if (this.selectedItem === undefined || this.selectedItem === null) {
            throw new Error("The selected item cannot be null.");
        }

        // Comprobar primero que no hay errores en el formulario a través del campo del elemento seleccionado
        // Si el objeto tiene id, es una actualización 
        let url: string;
        if (this.doesSelectedEntityHaveId()) {
            url = properties.apiUrl + "/update";
        } else {
            url = properties.apiUrl + "/create";
        }

        const promise = this.makeRequestToAPI(url, this.getRequestOptionsForViewState(null, this.fields, this.joins, this.filters,
            this.group_by, this.order, this.rowOffset, this.rowLimit));

        if (promise !== undefined) {
            promise.then((result) => {
                // Si el resultado ha sido correcto es un código 200
                if (result['status_code'] !== undefined && result['status_code'] !== null && result['status_code'] === 200) {
                    this.setState({ viewState: ViewStates.DETAIL });
                    toast.success(result['response_object']);
                } else {
                    throw new Error(result['response_object']);
                }
            }).catch((error) => toast.error(error.message));
        }
    };

    /**
     * Función de borrado de elementos.
     * 
     * @param {entity_class} Elemento a eliminar. 
     */
    deleteItem = async (elementToDelete: T) => {
        // Asigno a itemToDelete el elemento pasado como parámetro.
        this.itemToDelete = elementToDelete;

        const promise = this.makeRequestToAPI(properties.apiUrl + "/delete", this.getRequestOptionsForViewState(ViewStates.DELETE, this.fields, this.joins,
            this.filters, this.group_by, this.order, this.rowOffset, this.rowLimit));

        if (promise !== undefined) {
            promise.then((result) => {
                // Si el resultado ha sido correcto es un código 200
                if (result['status_code'] !== undefined && result['status_code'] !== null && result['status_code'] === 200) {
                    toast.success(result['response_object']);
                    this.itemToDelete = null;
                    // Cargar datos
                    this.fetchData();
                } else {
                    throw new Error(result['response_object']);
                }
            }).catch((error) => toast.error(error.message));
        }
    }

    /**
     * Función de carga de elemento.
     * 
     * @param {entity_class} Elemento a seleccionar. 
     */
    loadItem = async (elementToSelect: T, newState: string | null = null) => {
        this.selectedItem = elementToSelect;

        const promise = this.makeRequestToAPI(properties.apiUrl + "/load", this.getRequestOptionsForDBOps(this.getRequestBodyForLoad()));

        if (promise !== undefined) {
            promise.then((result) => {
                // Si el resultado ha sido correcto es un código 200
                if (result['status_code'] !== undefined && result['status_code'] !== null && result['status_code'] === 200) {
                    this.selectedItem = this.entity_class.fromJSON(result['response_object']);
                    // Cambiar estado.
                    if (newState !== null) {
                        this.setState({
                            viewState: newState
                        });
                    }
                } else {
                    this.selectedItem = null;
                    throw new Error(result['response_object']);
                }
            }).catch((error) => {
                toast.error(error.message);
            });
        }
    }

    /**
     * Devuelve un recuento de registros de acuerdo con los filtros y joins actuales del controlador.
     * 
     * @returns Promise<number>
     * @throws Error si sucede algún problema al llamar a la API.
     */
    public async countRowsByControllerClauses(): Promise<number> {
        const req_options: RequestInit = this.getRequestOptionsForViewState(ViewStates.LIST, null, this.joins, this.filters, null, null, null, null);
        return this.makeRequestToAPI(properties.apiUrl + "/count", req_options).then(
            (result) => {
                if (result['success'] === true) {
                    return result['response_object'] as number;
                } else {
                    throw new Error(result['response_object']);
                }
            }
        ).catch((error) => {
            throw error;
        });
    }

    // SUGGESTION
    /**
     * Método genérico para buscar resultados de un suggestion-box.
     * 
     * @param {string} inputText Texto que se usará en los filtros por coincidencia.
     * @param {list} filter_fields Lista de strings con nombre de campos de la entidad a partir de los cuáles elaborar un filtro "Empieza por..." encadenado por operadores OR.
     * @param {list} select_fields Lista de strings con nombre de campos de la entidad que se desean mostrar en el listado de sugerencias.
     * @param {string} id_field_name Nombre del campo id de la entidad.
     * @param {string} target_entity Entidad objetivo de la búsqueda.
     * @returns {list} Devuelve una lista de resultados obtenidos de la api, o bien una lista vacía si no encuentra nada.
     */
    async suggestEntities(inputText: string, filter_fields: Array<string>, select_fields: Array<string>,
        id_field_name: string, target_entity: string): Promise<Array<any>> {
        // Inicializo la lista de filtros y compruebo si es el primero para no añadirle un operador OR.
        const filters = [];

        for (var i = 0; i < filter_fields.length; i++) {
            if (i === 0) {
                filters.push(new FilterClause(filter_fields[i], FilterTypes.STARTS_WITH, inputText));
            } else {
                filters.push(new FilterClause(filter_fields[i], FilterTypes.STARTS_WITH, inputText, OperatorTypes.OR));
            }
        }

        // Campos: el id tengo que pasarlo siempre
        const fields = [
            new FieldClause(id_field_name),
        ];

        // Añadir resto de campos
        for (let field of select_fields) {
            fields.push(new FieldClause(field));
        }

        // Buscar una forma de poder pasar null o nada mejor.
        const req_options = this.getRequestOptionsForViewState(ViewStates.LIST, fields, null, filters, null, null, 0, 25, target_entity);
        return await this.makeRequestToAPI(properties.apiUrl + '/select', req_options, false).then(
            (result) => {
                // Determinar el resultado
                // Es una lista de diccionarios: aquellas claves que no formen parte de la lista de fields, las elimino
                const r_list = result['response_object'];

                if (r_list !== undefined && r_list !== null && r_list.length > 0) {
                    // Eliminar las claves que no formen parte del listado de campos seleccionado
                    var selected_fields: Array<string> = [];
                    var not_selected_fields: Array<string> = [];

                    // Array de campos seleccionados en los fieldclauses
                    fields.forEach(field => selected_fields.push(field.field_name));

                    // Como todos los elementos del resultado tienen las mismas claves, utilizo el primer elemento para obtener aquellas claves que no forman parte
                    // del conjunto de campos seleccionados
                    Object.keys(r_list[0]).forEach(function (k) {
                        if (!selected_fields.includes(k)) {
                            not_selected_fields.push(k);
                        }
                    });

                    // Recorro los diccionarios y elimino esas claves
                    r_list.forEach((dict: any) => not_selected_fields.forEach(e => delete dict[e]));
                    return r_list;
                } else {
                    return [];
                }
            }
        ).catch((error) => {
            toast.error(error.message);
            return [];
        });
    }


    // VALIDACIÓN
    /**
     * Esta función está pensada para ejecutan más de una validación sobre un mismo campo.
     * 
     * @param {BaseEntity} item_to_check Entidad a comprobar.
     * @param {string} field_name Nombre del campo a validar.
     * @param  {...ViewValidators} validators Listado de enumerado de ViewValidators.
     * @returns {boolean} true si es válido, false si no lo es.
     */
    validateField = (item_to_check: T | null, field_name: string, validators: Array<string>): Promise<boolean> | boolean | null => {
        // Si el ítem es null, devuelvo null
        if (item_to_check === null) {
            return null;
        }

        // Asumo que será válido
        var is_valid: Promise<boolean> | boolean = true;

        // Declaro la función a llamar y sus parámetros
        let function_to_call: VALIDATION_FUNCTION_TYPE;

        for (let validator of validators) {
            // Si algún validador devuelve false, que no continúe
            if (!is_valid) {
                break;
            }

            // Voy comprobando los validadores pasados como parámetro
            switch (validator) {

                case ViewValidators.CODE_VALIDATOR:
                    // Validador de código
                    function_to_call = this.code_is_valid;
                    is_valid = this.executeValidateFunction(function_to_call, [item_to_check, field_name]);
                    break;

                case ViewValidators.IS_NUMERIC_VALIDATOR:
                    // Validador de string numérico
                    function_to_call = this.string_is_only_numbers;
                    is_valid = this.executeValidateFunction(function_to_call, [get_property_value_by_name(item_to_check, field_name)]);
                    break;

                default:
                    break;
            }
        }

        return is_valid;
    }

    /**
     * Función asíncrona para validar un objeto pasado como parámetro.
     * 
     * @param {any} item_to_check Elemento a validar.
     * @param {string} field_name Nombre del campo a validar.
     * @param {func} callback Función a ejecutar. Debería devolver un string con el error en caso de que se produzca, o no devolver nada si todo ha ido bien.
     * @param {array} params Array de parámetros para la función.
     * @returns {boolean} true si es válido, false si no lo es.
     */
    protected async executeValidateFunction(callback: () => string | boolean | React.ReactNode | Promise<any>, params?: any): Promise<boolean> {
        // Llamar a función de validación. Importante utilizar await para que la función asíncrona espera al resultado de la promesa.
        const error = await callback.apply(this, params);

        // Si ha devuelto algo distinto de undefined/null significa que se ha producido algún error
        if (error !== undefined && error !== null) {
            // Mostrar aviso de error
            toast.error(error);
            return false;
        } else {
            return true;
        }
    }

    /**
     * Acción de validación de código de elemento seleccionado. Comprueba si ya existe un código igual en la base de datos. Se utiliza el elemento seleccionado para ello.
     * 
     * @param {any} item_to_check Si null, se utilizará el elemento seleccionado (this.selectedItem). 
     * @param {string} field_code_name Si null, se utilizará el nombre del campo "código" del elemento seleccionado.
     * @param {List[FilterClause]} additional_filters Filtros adicionales que se quisieran introducir.
     */
    code_is_valid = async (item_to_check: T | null = null, field_code_name: string | null = null,
        additional_filters: Array<FilterClause> | null = null): Promise<React.ReactNode | null> => {
        item_to_check = item_to_check !== null ? item_to_check : this.selectedItem;
        var field_code_name_: string = field_code_name !== null ? field_code_name : this.entity_class.getCodigoFieldName();

        const codigo: string = get_property_value_by_name(item_to_check, field_code_name_);

        // Filtrar por código de tipo de cliente.
        const filters: Array<FilterClause> = [new FilterClause(field_code_name_, FilterTypes.EQUALS, codigo)];

        // Necesito el id por si fuera una actualización, para que no valide el código sobre sí mismo.
        const id = this.getSelectedItemIdFieldValue();
        if (id !== null) {
            // Si tiene id, añadir un filtro para excluir el recuento sobre sí mismo
            filters.push(new FilterClause(this.entity_class.getIdFieldName(), FilterTypes.NOT_EQUALS, id));
        }

        // Añadir los filtros adicionales si los hubiera
        if (additional_filters !== null && additional_filters.length > 0) {
            for (let i = 0; i < additional_filters.length; i++) {
                filters.push(additional_filters[i]);
            }
        }

        // Consultar con la API si ya existe un registro en la tabla con el código introducido. Importante devolver la promesa para recoger el resultado en la función validate.
        return await this.makeRequestToAPI(properties.apiUrl + "/count", this.getRequestOptionsForViewState(ViewStates.VALIDATE, null, null, filters,
            null, null, null, null)).then(
                (result) => {
                    if (result['success'] === true) {
                        // Si count es mayor que cero, es que ya existe un registro con el mismo código
                        const count: number = result['response_object'];

                        if (count !== undefined && count !== null && count > 0) {
                            // Avisar al usuario
                            return <FormattedMessage id="i18n_error_codeAlreadyExists" values={{ 0: codigo }} />;
                        } else {
                            return null;
                        }
                    } else {
                        throw new Error(result['response_object']);
                    }
                }
            ).catch((error) => {
                toast.error(error.message);
                return null;
            })
    }

    /**
     * Valida si el string introducido está compuesto sólo por números.
     * 
     * @param {string} text 
     * @returns null si es válido, una cadena con el error si no lo es.
     */
    string_is_only_numbers = (text: string): React.ReactNode | null => {
        return (/^\d+$/.test(text) ? null : <FormattedMessage id="i18n_error_stringIsNotNumber" />);
    }

}