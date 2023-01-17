import React from 'react'
import { FormattedMessage } from "react-intl";
import ImageButton from './image-button';

import { resolve_property_by_string, generateUuid, BIG_SCREEN_WIDTH } from '../utils/helper-utils'
import DataTableHeader from '../view/table-header'
import BaseEntity from '../model/base_entity';

import './styles/table.css';


/**
 * Propiedades que espera el componente.
 */
interface IDataTableProps {
    headers: Array<DataTableHeader>;
    data: Array<BaseEntity>;
    table_name: string;
    id_field_name: string;
    selectAction?(d: BaseEntity): any;
    editAction(d: BaseEntity): any;
    deleteAction(d: BaseEntity): any;
    onHeaderOrderClick(h: DataTableHeader): any;
}

/**
 * Atributos de estado del componente.
 */
interface IDataTableState {
    headers: Array<DataTableHeader>;
    data: Array<BaseEntity>;
    screenIsbig: boolean;
}

/**
 * Clase de tabla de datos.
 */
export default class DataTable extends React.Component<IDataTableProps, IDataTableState> {

    /**
     * Identificador único de la tabla generado aleatoriamente.
     */
    uuid: string

    constructor(props: IDataTableProps) {
        super(props);

        /**
         * Id único de componente.
         */
        this.uuid = generateUuid();

        this.state = {
            headers: props.headers,
            data: props.data,
            screenIsbig: true
        }
    }

    /**
     * Función para controlar el redimensionado de la pantalla y modificar en consecuencia el estado del componente.
     */
    private handleResize(): void {
        if(window.innerWidth < BIG_SCREEN_WIDTH) {
            this.setState({screenIsbig: false})
        } else {
            this.setState({screenIsbig: true});
        }
    }

    // Sobrescritura de componentDidMount para añadir un listener con el que se enlaza al componente la función de redimensionado.
    componentDidMount() {
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    // Sobrescritura de componentWillUnmount para eliminar el el listener de eventos de la ventana.
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize.bind(this));
    }

    // Sobrescribo este método estático para mantener el componente actualizado ante cualquier cambio en los datos.
    static getDerivedStateFromProps(nextProps: IDataTableProps, prevState: IDataTableState) {
        const { data, headers } = nextProps;

        // Lo que hago es comparar los datos del estado previo con los nuevos que vengan en las propiedades entrantes. Si son distintos, actualizo el estado.
        return data === prevState.data && headers === prevState.headers
            ? null
            : { data: data, headers: headers };
    }

    //componentDidUpdate(nextProps) {
    // Esto se ejecuta tras getDerivedStateFromProps. Puede ser útil si condicionalmente hay que hacer algo en ese momento.
    //}

    /**
     * Renderizado de datos de cada fila de la tabla.
     * @param {*} d 
     * @returns 
     */
    renderRowData(d: BaseEntity, attributes: Array<DataTableHeader>) {
        const table_name = this.props.table_name;
        const uuid = this.uuid;

        var select_button = null;
        if (this.props.selectAction !== undefined) {
            const action_select = this.props.selectAction;
            select_button = <ImageButton className='select-button' onClick={() => action_select(d)}  
                btnTooltip={<FormattedMessage id='i18n_select_button' />} btnTooltipDirection="right" />;
        }

        // Columna de acciones
        const actionColumn = <td key={uuid + ":" + table_name + ":column:actions:" + d.uuid} style={{width: '10px'}}>
            <div className="action-column-div">
                {select_button}
                <ImageButton className='edit-button' onClick={() => this.props.editAction(d)} 
                    btnTooltip={<FormattedMessage id='i18n_edit_button' />} />
                <ImageButton className='delete' onClick={() => this.props.deleteAction(d)} 
                    btnTooltip={<FormattedMessage id='i18n_common_delete' />} btnTooltipDirection="right"  />
            </div>
        </td>;

        // Columnas a partir de los atributos del objeto
        const columns = attributes.map(function (header: DataTableHeader) {
            // Utilizo la función resolve_property_by_string, la cual es capaz de resolver los atributos de un objeto, 
            // incluidos los de objetos anidados.
            return <td key={uuid + ":" + table_name + ":column:" + header.field_name}
                style={(header.field_format != null && (header.field_format === 'INTEGER' || header.field_format === 'FLOAT')) ?
                    { textAlign: "right" } : { textAlign: "left" }}
                headers={header.field_name}>{header.convert_value_as_header_format(resolve_property_by_string(header.field_name, d))}
            </td>
        });

        return <tr key={uuid + ":" + table_name + ":row:" + d.uuid}>{actionColumn}{columns}</tr>
    }

    /**
     * Renderizado de datos de la tabla.
     * @param {*} data 
     * @returns 
     */
    renderTableData(data: Array<BaseEntity>, attributes: Array<DataTableHeader>) {
        return data.map((d, index) => {
            // Utilizo el nombre del campo id para obtener el identificador único de cada fila.
            return this.renderRowData(d, attributes);
        });
    }

    /**
     * Renderiza las cabeceras.
     * 
     * @param {*} headers 
     * @returns headers_render
     */
    renderHeaders(headers: Array<DataTableHeader>) {
        const uuid = this.uuid;
        const table_name = this.props.table_name;

        // Cabecera para columna de acciones
        const actions_header = <th key={uuid + ":" + table_name + ':header:actionColumnHeader'}>
            <FormattedMessage id="i18n_common_actions" />
        </th>

        const headers_render = headers.map((step, i) => {
            return (
                // En función del tipo de dato, alinear a izquierda o derecha. Los datos numéricos van a la derecha.
                <th key={uuid + ":" + table_name + ':header:' + headers[i].index}
                    style={(headers[i].field_format != null && (headers[i].field_format === 'INTEGER' || headers[i].field_format === 'FLOAT')) ?
                        { textAlign: "right", width: headers[i].width } : { textAlign: "left", width: headers[i].width }}>

                    <FormattedMessage id={headers[i].field_label} />

                    <button className="order-button" onClick={() => this.props.onHeaderOrderClick(headers[i])}>
                        {headers[i].order_state == null ? String.fromCharCode(8691) : (headers[i].order_state === 'up' ? String.fromCharCode(8679) :
                            String.fromCharCode(8681))}
                    </button>

                </th>
            );
        });

        return <tr key={uuid + ":" + table_name + ":headers_row"}>{actions_header}{headers_render}</tr>;
    }

    render() {
        const { headers, data } = this.state;

        // Defino las cabeceras. Observar que estoy pintando flechas en función del estado del orden de la cabecera usando el valor decimal de los símbolos unicode.
        const headers_render = this.renderHeaders(headers);

        // Comprobar el tamaño de pantalla
        var style = "my-table";
        // Si es menor a 1200px, activar el modo responsive
        if(!this.state.screenIsbig) {
            style = "my-table-responsive";
        }

        return (
            <div style={{ display: 'block' }}>
                <table className={style}>
                    <thead>
                        {headers_render}
                    </thead>

                    <tbody>
                        {this.renderTableData(data, headers)}
                    </tbody>
                </table>
            </div>
        );
    }
}