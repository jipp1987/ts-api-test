import React, { Component } from 'react';
import Tab from './tab';

import { generateUuid } from '../utils/helper-utils'
import './styles/tabs.css';


/**
 * Clase para modelado de datos de la pestaña.
 */
class DataTab {
    
    label: string;
    content: any;
    id: string;
    
    constructor(label: string, content: any, id: string) {
        this.label = label;
        this.content = content;
        this.id = id;
    }
}

/**
 * Propiedades del tabPanel.
 */
interface ITabPanelProps {
    /**
     * Función que espera el contenido de un componente lazy cargado dinámicamente.
     * 
     * @param content Ruta del componente partiendo del nivel de App.tsx. 
     * @returns Componente lazyload de react para carga dinámica.
     */
    get_component(content: string): any;
    
    /**
     * Función para cerrar limpiar los datos de la pestaña en localStorage al cerrarla.
     * 
     * @param {number} tab 
     */
    cleanLocalDataOnTabClose(tab: number): void;
}

/**
 * Atributos de estado del tabPanel.
 */
interface ITabPanelState {
    activeTab: null | number;
    data: Array<DataTab>;
}

/**
 * Componente de panel de pestañas dinámico.
 */
export default class TabPanel extends Component<ITabPanelProps, ITabPanelState> {

    constructor(props: ITabPanelProps) {
        super(props);

        this.state = {
            activeTab: null,
            data: []
        };
    }

    /**
     * Función para almecenar los datos del tabpanel en almacenamiento local.
     */
     saveStateToLocalStorage() {
        const { activeTab, data } = this.state;

        localStorage.setItem('activeTab', JSON.stringify(activeTab));
        localStorage.setItem('data', JSON.stringify(data));
    }

    /**
     * Sobrescritura de componentDidMount para recuperar los datos de localStorage al cargar la página. 
     */
     componentDidMount() {
        const json_activeTab: string | null = localStorage.getItem("activeTab"); 
        const json_data: string | null = localStorage.getItem("data"); 
        const v_activeTab: number | null = json_activeTab !== null ? JSON.parse(json_activeTab) : null;
        const v_data: Array<DataTab> | null = json_data !== null ? JSON.parse(json_data) : null;

        // OJO!!! Vigilar que los datos almacenados en localStorage no sean null, sino provocará errores.
        this.setState({ activeTab: v_activeTab, data: (v_data !== null ? v_data : []) });

        // Añade listener para guardar el estado en localStorage cuando el usuario abandona o refresca la página
        window.addEventListener(
            "beforeunload",
            this.saveStateToLocalStorage.bind(this)
        );
    }

    /**
     * Sobrescritura de componentWillUnmount para guardar los datos en localStorage al recargar la página. 
     */
    componentWillUnmount() {
        // Eliminar el listener definido en componentDidMount
        window.removeEventListener(
            "beforeunload",
            this.saveStateToLocalStorage.bind(this)
        );

        // Guarda el estado
        this.saveStateToLocalStorage();
    }

    /**
     * Acción de click en una pestaña: modifica la pestaña activa.
     * 
     * @param {*} tab 
     */
    onClickTabItem = (tab: number) => {
        // Modifica el estado del panel cambiando la pestaña activa.
        this.setState({ activeTab: tab });
    }

    /**
     * Acción de click para cerrar una pestaña.
     * 
     * @param {*} tab Índice de la pestaña a eliminar.
     */
    onCloseTabItem = (tab: number) => {
        // Clono los datos del estado del TabPanel.
        let data = this.state.data.slice();

        // Eliminar la pestaña de almacenamiento local
        if (this.props.cleanLocalDataOnTabClose !== undefined) {
            this.props.cleanLocalDataOnTabClose(tab);
        }

        const { activeTab } = this.state;

        // Eliminar elemento por índice
        data.splice(tab, 1);

        // Calcular la nueva pestaña seleccionada
        let newActiveTab: number | null = null;

        // Si la longitud del nuevo contenido es mayor que cero, hago el cálculo
        if (data.length > 0) {
            // Esto lo hago sólo si se ha cerrado la pestaña activa
            if (tab === activeTab) {
                // Si se ha eliminado la primera pestaña, la pestaña activa es la cero
                if (tab === 0) {
                    newActiveTab = 0;
                } else {
                    // Si no se ha eliminado la primera pestaña, la nueva pestaña activa es la inmediatamente anterior.
                    newActiveTab = tab - 1;
                }
            } else {
                // Si se ha cerrado una pestaña distinta a la activa y es anterior a ésta, la nueva pestaña será una anterior
                if (activeTab !== null) {
                    newActiveTab = activeTab > tab ? activeTab - 1 : activeTab;
                }
            }
        } else {
            // Si se han eliminado todas las pestañas, la nueva pestaña activa es null
            newActiveTab = null;
        }

        // Modifico el estado: tanto los nuevos datos como la pestaña activa (la última en añadirse).
        this.setState({ data: data, activeTab: newActiveTab })
    }

    /**
     * Evento para manejar la adición de nuevas pestañas.
     * 
     * @param {*} label 
     * @param {*} tab 
     */
    handleAddTab(label: string, tab: number) {
        // Clono los datos del estado del TabPanel.
        let data = this.state.data.slice();

        // Si no hay datos, mejor que limpie el almacenamiento local. Sino puede producir un comportamiento extraño al recargar la página cuando no hay pestañas:
        // parece que deja almacenada la última pestaña, y si la nueva no coincide con ésta se produce un error en la api al enviarle los datos que no corresponden con la vista.
        if (data.length === 0) {
            localStorage.clear();
        }

        // Si no hay datos, mejor que limpie el almacenamiento local. Sino puede producir un comportamiento extraño al recargar la página cuando no hay pestañas:
        // parece que deja almacenada la última pestaña, y si la nueva no coincide con ésta se produce un error en la api al enviarle los datos que no corresponden con la vista.
        if (data.length === 0) {
            localStorage.clear();
        }

        // Modifico el listado añadiendo un nuevo tab.
        data.push(new DataTab(label, tab, generateUuid()));

        // Modifico el estado: tanto los nuevos datos como la pestaña activa (la última en añadirse).
        this.setState({ data: data, activeTab: data.length - 1 })
    }

    render() {
        // Obtengo propiedades que voy a utilizar durante el render.
        const {
            onClickTabItem,
            onCloseTabItem,
            state: {
                activeTab,
                data,
            }
        } = this;
        
        // Compruebo que haya datos (pestañas).
        if (data !== null && data.length > 0 && activeTab !== null) {

            return (
                <div className="tabs">
                    <ol className="tab-list">

                        {data.map((step, i) => {
                            const label = data[i].label;
                            const id = data[i].id;

                            // Primero pinto los botones de las pestañas, que contendrán la lógica de cambio y cierre de pestañas utilizando funciones definidas aquí.
                            return (
                                <Tab
                                    key={'tab$$' + id}
                                    activeTab={activeTab}
                                    tabIndex={i}
                                    label={label}
                                    onClick={onClickTabItem}
                                    onCloseClick={onCloseTabItem}
                                />
                            );
                        })}
                    </ol>

                    <div className="tab-content">

                        {data.map((step, i) => {
                            // Cargo el componente utilizando la función enviada como parámetro (la dejo a nivel de componente principal de la aplicación para 
                            // poder cargar más fácilmente los componentes dinámicos buscándolos desde la raíz del proyecto).
                            const LazyComponent = this.props.get_component(step.content);
                            const id = step.id;

                            // Muy importante esto: para cambiar lo que ve el usuario se utiliza el estilo. Las pestañas no activas tiene display none; debe ser así 
                            // porque si por ejemplo devolviese null o undefined el componente se cargaría de nuevo cada vez que cambio de pestaña y por tanto no mantendría el 
                            // estado.
                            // OJO!!! NO usar como key el propio índice, puede dar lugar a comportamientos inesperados (por ejemplo, volver a llamar al constructor de un componente)
                            // así como problemas de rendimiento.
                            // Observar que la posición es relativa. Esto es así para que los modales (con posición absoluta) sólo afecten a la pestaña sobre la que están abiertos
                            // y no a toda la pantalla.

                            return (
                                <div key={'tabDiv$$' + id} id={'tabDiv$$' + id}
                                    style={{ display: i === activeTab ? 'block' : 'none', position: 'relative', height: '100%', overflow: 'auto' }}>
                                    <LazyComponent key={id} tab={i} parentContainer={'tabDiv$$' + id} />
                                </div>
                            );
                        })}

                    </div>

                </div>
            );
        } else {
            // Si no hay pestañas devuelvo null para que no pinte nada.
            return null;
        }
    }
}