import React, { useState, useEffect } from 'react';

import Tooltip from './tooltip';

import { FormattedMessage } from "react-intl";
import { generateUuid } from '../utils/helper-utils'

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
     * Tooltip. Puede ser un string o un nodo de React, por si fuera una traducción de react-intl.
     */
    btnTooltip?: React.ReactNode | string;
    /**
     * Localización del tooltip. Si no se espefifica tooltip, esta propiedad será ignorada.
     */
    btnTooltipDirection?: "top" | "bottom" | "left" | "right"; 
}

/**
 * Botón con imagen.
 */
export default function ImageButton({ id, title, type, style, className, onClick, disabled, btnTooltip, btnTooltipDirection }: IImageButtonProps) {
    // Defino habilitado como atributo de estado del componente porque puede habilitarse/desabilitarse durante un rerender
    const [enabled, setEnabled] = useState<boolean>(disabled !== undefined && disabled === true ? false : true);
    const [buttonId] = useState<string>(id === undefined || id === null ? generateUuid() : id);
    const [buttonType] = useState<"button" | "submit" | "reset">(type === undefined || type === null ? 'button' : type);

    // Utilizo un hook para forzar el rerender el componente en caso de que desde las propiedades cambie el valor
    useEffect(() => {
        setEnabled(!disabled);
    }, [disabled]);

    // Etiqueta del botón
    const label = title !== undefined && title !== null ?
        <span className='btn-text'><FormattedMessage id={title} /></span> : null;

    // Definir el botón.
    var btn_: React.ReactNode = <div className={enabled ? 'btn-container' : 'btn-container-disabled'}>
        <button className="custom-button" id={buttonId} type={buttonType} onClick={onClick} style={style} disabled={!enabled}>
            <span className={'image-button ' + className}></span>
            {label}
        </button></div>;

    // Si hay un tooltip, envolver al botón en el mismo.
    if (btnTooltip !== undefined) {
        const direction = btnTooltipDirection !== undefined ? btnTooltipDirection : "bottom";
        btn_ = <Tooltip content={btnTooltip} direction={direction}>{btn_}</Tooltip>
    }

    return (
        <>
            {btn_}
        </>
    );
}