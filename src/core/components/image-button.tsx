import React, { useState, useEffect } from 'react';

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
}

/**
 * Botón con imagen.
 */
export default function ImageButton({id, title, type, style, className, onClick, disabled}: IImageButtonProps) {
    // Defino habilitado como atributo de estado del componente porque puede habilitarse/desabilitarse durante un rerender
    const [enabled, setEnabled] = useState<boolean>(disabled !== undefined && disabled === true ? false : true);

    // Utilizo un hook para forzar el rerender el componente en caso de que desde las propiedades cambie el valor
    useEffect(() => {
        setEnabled(!disabled);
    }, [disabled]);

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


    // Etiqueta del botón
    const label = title !== undefined && title !== null ? 
        <span className='btn-text'><FormattedMessage id={title} /></span> : null;

    return (
        <div className={enabled ? 'btn-container': 'btn-container-disabled'}>
            <button className="custom-button" id={id_} type={type_} onClick={onClick} style={style} disabled={!enabled}>
                <span className={'image-button ' + className}></span>
                {label}
            </button>
        </div>
    );
}