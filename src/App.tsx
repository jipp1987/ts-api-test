import React, { useState, useRef } from 'react';
import { IntlProvider, FormattedMessage } from "react-intl";

import TabPanel from './core/components/tab-panel';
import { Toaster } from 'react-hot-toast';

import { VIEW_MAP } from './impl/view/view_map';
import { SAVE_SEPARATOR, TAB_TO_DELETE } from "src/core/utils/helper-utils";

import messages_en from "./translations/en.json";
import messages_es from "./translations/es.json";

import './App.css';

// Carga de mensajes
const messages = new Map<string, any>([
  ['es', messages_es],
  ['en', messages_en]
]);

/**
 * Propiedades del menú lateral.
 */
interface MenuProps {
  onClick(label: string, component: string): void;
  parentRef: React.LegacyRef<HTMLUListElement>;
}

/**
 * Menú lateral de la aplicación.
 * 
 * @returns Menú lateral de la aplicación.
 */
function Menu({ onClick, parentRef }: MenuProps) {
  // Array de tuplas string-string con la etiqueta del componente y el nombre del componente dentro de la aplicación.
  // Se utilizar para la carga dinámica de componentes.
  const menuOptions: Array<[string, string]> = [
    ['i18n_clientes_title', 'ClienteView'],
    ['i18n_tipos_cliente_title', 'TipoClienteView'],
    ['i18n_usuarios_title', 'UsuarioView']
  ];

  // Los ítems del menú son un listado creado a partir de la pripiedad menuOptions
  const items = menuOptions.map((item) => {
    return (
      <li key={"leftMenuOption:" + item} onClick={() => onClick(item[0], item[1])}>
        <span><FormattedMessage id={item[0]} /></span>
      </li>
    );
  });

  return (<ul className="menuLeft" ref={parentRef}>
    {items}
  </ul>);
}

/**
 * Componente principal de la aplicación.
 * 
 * @returns Componente principal de la aplicación.
 */
export default function App() {
  // Referencias a componentes.
  const menu: any = useRef<HTMLUListElement>(null);
  const tabPanel: any = useRef(null);

  // Idioma de la aplicación.
  const [lang, setLang] = useState<string>("es");

  /**
   * Función para añadir pestañas a panel de pestañas.
   * 
   * @param label 
   * @param tab 
   */
  const addTabToTabPanel = (label: string, component: string) => {
    // Utilizo la referencia al tabPanel y llamo a su función definida handleAddTab.
    tabPanel.current.handleAddTab(label, VIEW_MAP[component]);
  }

  /**
   * Función para obtener el componente de forma dinámica.
   * 
   * @param {string} route Ruta absoluta del componente SIN la url base ("src/" en este caso) incluida en la misma.  
   * @returns LazyComponent
   */
  const get_lazy_component = (route: string) => {
    // Tengo que partir siempre de src, sino lo hago así por algún motivo la función no es capaz de encontrarlo.
    return require("src/" + route).default;
  }

  /**
   * Elimina datos de la pestaña de localStore. Pensado para el cierre de la pestaña.
   * 
   * @param {number} tab 
   */
  const delete_data_on_tab_close = (tab: number) => {
    // Borro todo localStorage, puesto que las pestañas se han reordenado.
    localStorage.clear();

    // Guardo en localStorage la pestaña que se va a cerrar para evitar que componentWillUnmount del viewController vuelva a 
    // guardar los datos (habrá que eliminar luego esta clave desde el controlador). Lo guardo como "true" para marcarlo de alguna forma, 
    // no puedo usar booleans.
    localStorage.setItem(TAB_TO_DELETE + SAVE_SEPARATOR + tab, "true");
  }

  return (
    <IntlProvider locale={lang} messages={messages.get(lang)}>
      <div id="main">

        <div id="header">
          <div style={{ float: 'left' }}>
            <h1>API REST</h1>
          </div>

          <div style={{ float: 'right' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button style={{ background: 'transparent', color: 'ghostwhite' }} onClick={() => { setLang("es") }}>ESPAÑOL</button>
              <button style={{ background: 'transparent', color: 'ghostwhite', marginTop: '5px' }} onClick={() => { setLang("en") }}>ENGLISH</button>
            </div>
          </div>
        </div>

        <div id="container">

          <div id="leftMenu">
            <h4 style={{ textTransform: 'uppercase' }}><FormattedMessage id="i18n_menu_title" /></h4><br />
            <Menu parentRef={menu} onClick={(label: string, component: string) => addTabToTabPanel(label, component)} />
          </div>

          <div id="panel">
            <div id="inner-panel">

              <Toaster
                position="top-right"
                containerStyle={{
                  position: 'relative',
                }}
                toastOptions={{
                  // Define default options
                  className: '',
                  duration: 5000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  // Default options for specific types
                  success: {
                    duration: 3000,
                    theme: {
                      primary: 'green',
                      secondary: 'black',
                    },
                  },
                }} />

              <TabPanel get_component={(route) => get_lazy_component(route)} ref={tabPanel}
                cleanLocalDataOnTabClose={(tab) => delete_data_on_tab_close(tab)} />

            </div>
          </div>

        </div>

        <div id="footer">
          <b>2023</b>
        </div>

      </div>
    </IntlProvider>
  );
}