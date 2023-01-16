import React, { useState, useEffect } from 'react';

import { FormattedMessage } from "react-intl";
import { generateUuid } from '../utils/helper-utils'

import Tooltip from './tooltip';

import './styles/buttons.css';


interface IImageButtonProps {
    /**
     * Id del botón.
     */
    id?: string;
    /**
     * Clave i18n para label del botón.
     */
    title?: string;
    /**
     * Tipo de botón html.
     */
    type?: "button" | "submit" | "reset";
    /**
     * Estilo css en línea.
     */
    style?: React.CSSProperties;
    /**
     * Nombre de clase css para el botón.
     */
    className: string;
    /**
     * Acción del botón.
     * 
     * @param params
     */
    onClick?(params?: any): any;
    /**
     * Botón habilitado.
     */
    disabled?: boolean;
    /**
     * Texto para el tooltip.
     */
    tooltip?: string;
}

/**
 * Botón con imagen.
 */
export default function ImageButton({ id, title, type, style, className, onClick, disabled, tooltip }: IImageButtonProps) {
    // Defino habilitado como atributo de estado del componente porque puede habilitarse/desabilitarse durante un rerender
    const [enabled, setEnabled] = useState<boolean>(disabled !== undefined && disabled === true ? false : true);
    const [button_id] = useState<string>(id === undefined || id === null ? generateUuid() : id);
    const [button_type] = useState<"button" | "submit" | "reset">(type === undefined || type === null ? 'button' : type);

    // Utilizo un hook para forzar el rerender el componente en caso de que desde las propiedades cambie el valor
    useEffect(() => {
        setEnabled(!disabled);
    }, [disabled]);

    // Etiqueta del botón
    const label = title !== undefined && title !== null ?
        <span className='btn-text'><FormattedMessage id={title} /></span> : null;

    // Tooltip
    var container_id: string = "btn-container_" + button_id;
    const tooltip_component: React.ReactNode | null = tooltip !== undefined && tooltip != null
        ? <Tooltip parentId={container_id} text={tooltip} /> : null;

    return (
        <>
            <div id={container_id} className={enabled ? 'btn-container' : 'btn-container-disabled'}>
                <button className="custom-button" id={button_id} type={button_type} onClick={onClick} style={style} disabled={!enabled}>
                    <span className={'image-button ' + className}></span>
                    {label}
                </button>
            </div>
            {tooltip_component}
        </>
    );
}