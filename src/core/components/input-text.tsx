import React, { useState, useEffect } from "react";

import './styles/inputs.css';

interface IInputTextProps {
    id: string;
    /**
     * Los inputs tienen siempre por detrás una entidad, un objeto.
     */
    entity: any;
    /**
     * Nombre de la propiedad del objeto que se está utilizando en el input.
     */
    valueName: string;
    /**
     * Etiqueta del input. Puede ser un string o un componente de React para los mensajes traducidos.
     */
    label: string | React.ReactNode;
    size?: number;
    maxLength?: number;
    minLength?: number;

    /**
     * Campo en estado de edición.
     */
    isEditing?: boolean;

    /**
     * Campo requerido.
     */
    isRequired?: boolean;

    /**
     * Acción de validación del campo.
     * 
     * @param params 
     */
    validation?(params?: any):  boolean | Promise<boolean> | null;

    /**
     * Acción posterior a la asignación y la validación.
     * 
     * @param params 
     */
    subsequentAction?(params?: any): void;
}


/**
 * Crea un input text.
 * 
 * @param props 
 */
export default function MyInput(props: IInputTextProps) {
    // Comprobar posibles valores null.
    const isRequiredProps: boolean = props.isRequired !== undefined && props.isRequired !== null ? props.isRequired : false;
    const isEditingProps: boolean = props.isEditing !== undefined && props.isEditing !== null ? props.isEditing : false;
    const valueProps = props.entity[props.valueName] !== undefined && props.entity[props.valueName] !== null ? props.entity[props.valueName] : "";

    // Estado inicial a partir de las propiedades
    const [value, setValue] = useState(valueProps);
    const [isRequired, setIsRequired] = useState(isRequiredProps);
    const [entity, setEntity] = useState(props.entity);
    const [isEditing, setIsEditing] = useState(isEditingProps);
    // const [result, setResult] = useState(null);

    // Obtener datos de las propiedades
    const { label, minLength, id } = props;
    // Si no se ha especificado máximo de caracteres, máximo 50
    const maxLength = props.maxLength === undefined ? 50 : props.maxLength;
    // Si no se ha especificado tamaño, por defecto el máximo de caracteres más 5 para que sea un poco más grande y no quede mal
    const size = props.size !== null && props.size !== undefined ? props.size : maxLength + 5;

    // Rerenderizado utilizando el hook useEffect. Se utiliza para detectar cambios en los valores de estado y forzar el rerender del componente.
    useEffect(() => {
        setIsRequired(isRequiredProps);
    }, [isRequiredProps]);

    useEffect(() => {
        setIsEditing(isEditingProps);
    }, [isEditingProps]);

    // Si cambia la entidad asociada, debe volver a renderizarse.
    useEffect(() => {
        setValue(valueProps);
    }, [props.entity, valueProps]);

    /**
     * Evento de cambio del input para modificar a la vez la propiedad del objeto asociado al mismo.
     * 
     * @param e Evento de cambio JS. 
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target;
        const entity_ = entity;

        // Tras un cambio en el input, actualizo también la entidad del modelo
        if (target !== undefined && target !== null && target.value !== undefined && target.value !== null) {
            var newValue = target.value;

            // Accedo a la propiedad del objeto usando keyof...
            const myVar = props.valueName as (keyof typeof entity_);
            entity_[myVar] = newValue;

            // El cambio de estado es tanto del valor del input como de la entidad, para mantenerla actualizada 
            setValue(newValue);
            setEntity(entity_);
        }
    }

    /**
     * Acción posterior tras perder el foco.
     */
    const onBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
        // Ejecutar primero los validadores si los hubiera
        // Asumo que va a ser null para evitar forzar el click al final si no hay eventos asíncronos; los eventos asíncronos durante la validación 
        // previenen el click del botón si se hace click sin salir del input, es decir, se lanza el onblur del input pero luego no hace click.
        var isValid = null;

        const { validation, subsequentAction } = props;

        // Validador de código
        if (validation !== undefined && validation !== null) {
            // Como validate me devuelve una promesa, la función debe ser asíncrona y tengo que poner un await aquí para esperar a recoger el resultado.
            isValid = await validation();
        }

        // Si ha llegado hasta aquí y hay acción posterior (y no ha habido validación o ésta ha sido correcta), ejecutar la acción
        var actionHasHappened = null;
        if ((isValid === null || isValid) && subsequentAction !== undefined && subsequentAction !== null) {
            await subsequentAction();
            actionHasHappened = true;
        }

        // Si se ha hecho click en un botón sin haber tabulado, se lanzará el evento onblur pero prevendrá el click del botón. Comprobando el relatedTarget del evento 
        // podemos forzar el click. Sólo pasamos por aquí si la validación ha sido ok.
        if ((isValid || actionHasHappened) && event !== undefined && event !== null) {
            const relatedTarget: any = event.relatedTarget;

            if (relatedTarget && ('submit' === relatedTarget.getAttribute('type') || 'button' === relatedTarget.getAttribute('type'))) {
                relatedTarget.click();
            }
        }
    };

    /**
     * Pinta un label para campos obligatorios.
     * 
     * @param {boolean} isRequired 
     * @returns {component}
     */
    const renderRequiredLabel = (isRequired: boolean): React.ReactNode | null => {
        if (isRequired) {
            return (
                <span style={{ color: 'red', fontWeight: 'bold', float: 'left', marginLeft: '5px' }}>*</span>
            )
        } else {
            return null;
        }
    }

    // Etiqueta de campo obligatorio
    const requiredLabel = renderRequiredLabel(isRequired);

    return (
        <div className="input-panel">

            <label htmlFor={id} className="my-label">{label}</label>

            <div style={{ float: 'left' }}>

                <input
                    id={id}
                    disabled={!isEditing ? true : false}
                    type="text"
                    className="my-input"
                    onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }}
                    onChange={(e) => handleChange(e)}
                    onBlur={(e) => onBlur(e)}
                    size={size}
                    maxLength={maxLength}
                    minLength={minLength}
                    value={value}
                    style={{ float: 'left' }}
                    required={isRequired ? true : false} />

                {requiredLabel}

            </div>

        </div>
    );
}