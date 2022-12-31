import React from 'react';

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
}

/**
 * Botón con imagen.
 */
export default function ImageButton({id, title, type, style, className, onClick}: IImageButtonProps) {
    // Comprobar si ha llegado un tipo
    var type_ = type;
    if (type === undefined || type === null) {
        // Botón por defecto
        type = 'button';
    }

    // Lo mismo con el id
    var id_ = id;
    if (id_ === undefined || id_ === null) {
        // Si no ha llegado id alguno, establecer uno por defecto
        id_ = generateUuid();
    }

    const label = title !== undefined && title !== null ? 
        <span className='btn-text'><FormattedMessage id={title} /></span> : null;

    return (
        <div className='btn-container'>
            <button className="custom-button" id={id_} type={type_} onClick={onClick} style={style}>
                <span className={'image-button ' + className}></span>
                {label}
            </button>
        </div>
    );
}