import React, { useState, useEffect, useRef } from "react";

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
    // Estado inicial a partir de las propiedades
    const valueProps: string = props.entity[props.valueName] !== undefined && props.entity[props.valueName] !== null ? props.entity[props.valueName] : "";
    const [value, setValue] = useState<string>(valueProps);
    // Utilizo esta variable de estado para almacenar el último valor del input, para prevenir ejecutar las acciones asociadas constantemente si no ha cambiado.
    const [lastValue, setLastValue] = useState<string>(valueProps);

    const [isRequired, setIsRequired] = useState<boolean>(props.isRequired !== undefined && props.isRequired !== null ? props.isRequired : false);
    const [entity, setEntity] = useState<any>(props.entity);
    const [isEditing, setIsEditing] = useState<boolean>(props.isEditing !== undefined && props.isEditing !== null ? props.isEditing : false);

    // Comprobar si hay error
    const [isInputError, setInputError] = useState<boolean>(false);

    // Referencia al input para forzar el foco al componente en caso de error
    const inputRef: React.MutableRefObject<any> = useRef<any>(null);

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
        setIsRequired(props.isRequired !== undefined && props.isRequired !== null ? props.isRequired : false);
    }, [props.isRequired]);

    useEffect(() => {
        setIsEditing(props.isEditing !== undefined && props.isEditing !== null ? props.isEditing : false);
    }, [props.isEditing]);

    // Si cambia la entidad asociada desde otro componente, el input debe volver a renderizarse.
    useEffect(() => {
        const newValue = props.entity[props.valueName] !== undefined && props.entity[props.valueName] !== null ? props.entity[props.valueName] : "";
        setValue(newValue);
        setLastValue(newValue);
        setEntity(props.entity);
    }, [props.entity, props.valueName]);

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
        if ((value === null || value === "") || value === lastValue) {
            return;
        }

        // Guardo el último valor para prevenir validar constantemente el input si no ha cambiado.
        setLastValue(value);

        // Ejecutar primero los validadores si los hubiera
        // Asumo que va a ser null para evitar forzar el click al final si no hay eventos asíncronos; los eventos asíncronos durante la validación 
        // previenen el click del botón si se hace click sin salir del input, es decir, se lanza el onblur del input pero luego no hace click.

        const { validation } = props;

        // Validador de código
        if (validation !== undefined && validation !== null) {
            // Como validate me devuelve una promesa, la función debe ser asíncrona y tengo que poner un await aquí para esperar a recoger el resultado.
            const result = await validation();
            // Si hay error.
            if (result !== undefined) {
                // Esto devuelve null o true si el valor es correcto, o false si no lo es.
                const isError: boolean = result === null || result ? false : true;
                setInputError(isError);
                // Foco en el componente
                if (isError) {
                    inputRef.current.focus();
                    inputRef.current.select();
                } else {
                    // Si el onBlur se ha ejecutado al hacer click en uno de los botones, el onClick de éstos no se disparará debido a que el onBlur
                    // tiene prioridad. No puedo prevenir esto, pero al menos puedo forzar a que si no hay error deje el foco puesto en el botón para que
                    // es usuario no pierda de vista dónde estaba.
                    if (event !== undefined && event !== null) {
                        const { relatedTarget } = event;
                        if (relatedTarget && ('submit' === relatedTarget.getAttribute('type') || 'button' === relatedTarget.getAttribute('type'))) {
                            (relatedTarget as HTMLInputElement).focus();
                        }
                    }
                }
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

            <label htmlFor={id} className={isInputError ? "my-label-error" : "my-label"}>{label}</label>

            <div style={{ marginLeft: '2px', float: 'left' }}>

                <input
                    id={id}
                    ref={inputRef}
                    disabled={!isEditing ? true : false}
                    type={props.isPassword !== undefined && props.isPassword ? "password" : "text"}
                    className={isInputError ? "my-input-error" : "my-input"}
                    onKeyDown={(e) => { e.key === 'Enter' && e.preventDefault(); }}
                    onChange={(e) => handleChange(e)}
                    onBlur={(e) => onBlur(e)}
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