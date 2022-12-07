import React from "react";
import ReactDOM from 'react-dom';

import ImageButton from './image-button';

import "./styles/modal.css";

interface IModalProps {
    parentContainer?: string;
    children: React.ReactNode;
    id?: string;
    /**
     * El título puede ser tanto un string como un nodo de React si fuese un mensaje traducido.
     */
    title: string | React.ReactNode;
    index?: number;
    width?: string;
    onClose?(params?: any): any;
}

/**
 * Función para crear un panel modal.
 * 
 * @param props 
 * @returns Modal.
 */
export default function modal(props: IModalProps) {
    // Ancho del modal: si no se ha especificado, serían 500px
    const width = props.width !== undefined && props.width !== null ? props.width : '500px';

    // Comprobar si ha llegado una función para onClose: en ese caso, crear sección para botón "cerrar modal"
    var closeButton = null;

    // Contenedor padre del modal (si no se define asumo que pertenece al elemento raíz, es decir, no pertenece a ninguna pestaña).
    const parentContainerId: string = props.parentContainer !== undefined && props.parentContainer !== null ? props.parentContainer : 'root';
    const elementToAttachModal: Element | DocumentFragment | null = document.getElementById(parentContainerId);

    if (props.onClose !== undefined && props.onClose !== null) {
        // Crear sección para mostrar el botón de cerrar
         closeButton =
            <ImageButton className='close-button' style={{ width: '30px', height: '15px' }} onClick={props.onClose} />
    }

    // Usamos stopPropagation para evitar que al hacer click en el interior del modal se lance el evento de cierre
    // Es decir, se lanza el evento de cierre sólo al hacer click fuera del modal (y si se ha establecido una función de cierre)
    // props-children no se define como tal en las propiedades del componente, sino que es la parte entre las etiquetas de apertura y cierre del mismo
    if (elementToAttachModal !== undefined && elementToAttachModal !== null) {
        return ReactDOM.createPortal(
            <div id={props.id} className="modal" onClick={props.onClose}>

                <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: width }}>

                    <div className="modal-header">
                        <div className="modal-title">{props.title}</div>
                        <div className="close-button-div">{closeButton}</div>
                    </div>


                    <div className="modal-body">{props.children}</div>

                </div>

            </div>, elementToAttachModal
        );
    } else {
        // Esto no debería suceder, pero si no encuentra el elemento al que pertenece el modal devuelvo null.
        return null;
    }
}