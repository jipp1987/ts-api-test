import React, { useState, useEffect } from 'react';
import { FormattedMessage } from "react-intl";

import './styles/tabs.css';

/**
 * Listado de propiedades de la pestaña, definidas como interfaz.
 */
interface ITabProps {
    activeTab: number;
    tabIndex: number;
    label: string;
    viewName: string;
    onClick(index: number): void;
    onCloseClick(index: number, viewName: string, subIndex?: number): void;
    /**
     * Lo utilizo para mostrar un subíndice cuando hay más de una pestaña de un mismo menú.
     */
    repeatedTabSubIndex?: number;
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
        onCloseClick,
        viewName,
        repeatedTabSubIndex
    } = props;

    const [subIndex, setSubIndex] = useState<string | null>(repeatedTabSubIndex !== undefined && repeatedTabSubIndex !== null && repeatedTabSubIndex !== 1
        ? ` (${repeatedTabSubIndex})` : null);

    // Repintar cuando cambie la propiedad de subíndice para pestañas repetidas
    useEffect(() => {
        setSubIndex(props.repeatedTabSubIndex !== undefined && props.repeatedTabSubIndex !== null && props.repeatedTabSubIndex !== 1
            ? ` (${props.repeatedTabSubIndex})` : null);
    }, [props.repeatedTabSubIndex]);

    // Lo utilizo para cambiar el estilo y así resaltar la pestaña activa.
    let className: string = 'tab-list-item';

    if (activeTab === tabIndex) {
        className += ' tab-list-active';
    }

    const subIndexLabel: React.ReactNode = subIndex !== undefined && subIndex !== null ? <>{subIndex}</> : null;

    return (
        <li key={'tabIndex$$' + tabIndex} className={className}>
            <span onClick={() => onClick(tabIndex)}><FormattedMessage id={label} />{subIndexLabel}</span>
            <button style={{ marginLeft: '10px' }} key={'tabIndexCloseButton$$' + tabIndex} onClick={() => onCloseClick(tabIndex, viewName, repeatedTabSubIndex)}>X</button>
        </li>
    );

}