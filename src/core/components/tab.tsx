import React from 'react';
import { FormattedMessage } from "react-intl";

import './styles/tabs.css';

/**
 * Listado de propiedades de la pestaña, definidas como interfaz.
 */
interface ITabProps {
    activeTab: number;
    tabIndex: number;
    label: string;
    onClick(index: number): void;
    onCloseClick(index: number): void;
}

/**
 * Pestaña de la aplicación.
 * @param props 
 * @returns Componente funcional react.
 */
export default function Tab(props: ITabProps) {
    const {
        onClick,
        activeTab,
        label,
        tabIndex,
        onCloseClick
    } = props;

    // Lo utilizo para cambiar el estilo y así resaltar la pestaña activa.
    let className: string = 'tab-list-item';

    if (activeTab === tabIndex) {
        className += ' tab-list-active';
    }

    return (
        <li key={'tabIndex$$' + tabIndex} className={className}>
            <span onClick={() => onClick(tabIndex)}><FormattedMessage id={label} /></span>
            <button style={{ marginLeft: '10px' }} key={'tabIndexCloseButton$$' + tabIndex} onClick={() => onCloseClick(tabIndex)}>X</button>
        </li>
    );

}