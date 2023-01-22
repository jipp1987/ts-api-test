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
    isInteger?: boolean;
    isFloat?: boolean;
    isPassword?: boolean;

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
    validation?(params?: any): boolean | Promise<boolean> | null;
}


/**
 * Crea un input text.
 * 
 * @param props 
 */
export default function InputText(props: IInputTextProps) {
    // Comprobar posibles valores null.
    const isRequiredProps: boolean = props.isRequired !== undefined && props.isRequired !== null ? props.isRequired : false;
    const isEditingProps: boolean = props.isEditing !== undefined && props.isEditing !== null ? props.isEditing : false;
    const valueProps = props.entity[props.valueName] !== undefined && props.entity[props.valueName] !== null ? props.entity[props.valueName] : "";

    // Esto lo almaceno como atributo de estado para evitar que, si no ha cambiado el valor, se ejecute la acción de validación en el onBlur
    const [originalValue] = useState<string>(valueProps);

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

    // Inputs numéricos
    const isInteger = props.isInteger !== undefined && props.isInteger;
    const isFloat = props.isFloat !== undefined && props.isFloat;

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
        setEntity(props.entity);
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

            // Validación para números
            if (isFloat && !/^[+-]?\d*(?:[.]\d*)?$/.test(newValue)) {
                e.preventDefault();
                return false;
            }

            if (isInteger && !/^[+-]?\d+$/.test(newValue)) {
                e.preventDefault();
                return false;
            }

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
        // Si el valor es null o bien el valor original (almacenado originalmente en valueProps) es igual al valor actual, que no active la validación.
        if ((value === null || value === "") || value === originalValue) {
            return;
        }

        // Ejecutar primero los validadores si los hubiera
        // Asumo que va a ser null para evitar forzar el click al final si no hay eventos asíncronos; los eventos asíncronos durante la validación 
        // previenen el click del botón si se hace click sin salir del input, es decir, se lanza el onblur del input pero luego no hace click.

        const { validation } = props;

        // Validador de código
        if (validation !== undefined && validation !== null) {
            // Como validate me devuelve una promesa, la función debe ser asíncrona y tengo que poner un await aquí para esperar a recoger el resultado.
            await validation();
        }
    };

    /**
     * Se utiliza para controlar si la pérdida de foco se debe a hacer click en un botón.
     * 
     * @param event 
     * @returns true si se hace click en un botón al salir del componente. 
     */
    const onLostFocusClickHandler = (event: React.FocusEvent<HTMLInputElement>): boolean => {
        var shouldFireOnBlur: boolean = true;

        if (event !== undefined && event !== null) {
            const relatedTarget: any = event.relatedTarget;

            // Se trata de averiguar si el evento onBlur se ha disparado por hacer click en algún botón. En ese caso, prevenimos ejecutar onBlur.
            // Lo hago porque el evento onBlur tiene prioridad sobre el evento onClick, y si el input tiene una validación asíncrona el onClick del botón
            // no se va a ejecutar. Una solución sería modificar onClick por onMouseDown en los botones porque tiene más prioridad que onBlur, pero no es buena
            // idea porque el evento onMouseDown es diferente de onClick y el comportamiento de la aplicación va a cambiar si lo hago así. 
            if (relatedTarget && ('submit' === relatedTarget.getAttribute('type') || 'button' === relatedTarget.getAttribute('type'))) {
                shouldFireOnBlur = false;
                // relatedTarget.click();
            }
        }

        return shouldFireOnBlur;
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

            <div style={{ marginLeft: '2px', float: 'left' }}>

                <input
                    id={id}
                    disabled={!isEditing ? true : false}
                    type={props.isPassword !== undefined && props.isPassword ? "password" : "text"}
                    className="my-input"
                    onKeyDown={(e) => { e.key === 'Enter' && e.preventDefault(); }}
                    onChange={(e) => handleChange(e)}
                    onBlur={(e) => { if (onLostFocusClickHandler(e)) { onBlur(e) } }}
                    size={size}
                    maxLength={maxLength}
                    minLength={minLength}
                    value={value}
                    style={isFloat || isInteger ? { textAlign: 'right', float: 'left' } : { float: 'left', textAlign: "left" }}
                    required={isRequired ? true : false} />

                {requiredLabel}

            </div>

        </div>
    );
}