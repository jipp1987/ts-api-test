import React, { useState, useEffect } from 'react';

import { generateUuid, ComboBoxValue } from '../utils/helper-utils'

import './styles/inputs.css';

interface IComboBoxProps {
    id?: string;
    values: Array<ComboBoxValue>;
    label?: string | React.ReactNode;
    isRequired?: boolean;
    onChangeAction?(param: any): any;
}

/**
 * Componente de selección única.
 * 
 * @param props 
 */
export default function ComboBox(props: IComboBoxProps) {

    const [values, setValues] = useState<Array<ComboBoxValue>>(props.values);
    const [selectedValue, setSelectedValue] = useState<any | null>(props.values[0]);
    const [id] = useState<string>(props.id !== undefined && props.id !== null ? props.id : generateUuid());

    // Si cambian los valores, debe repintarse el componente
    useEffect(() => {
        setValues(props.values);
    }, [props.values]);

    /**
     * Función de cambio de valor.
     * 
     * @param event 
     */
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedValue(event.target.value);

        // Ejecutar acción pasada como parámetro en caso de haberse establecido una en las propiedades.
        if (props.onChangeAction !== undefined) {
            props.onChangeAction(event.target.value);
        }
    };

    // Label
    const combo_label: React.ReactNode | null = props.label !== undefined && props.label !== null ?
        <label htmlFor={id} className="my-label">{props.label}</label> : null;

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
    const required: boolean = props.isRequired !== undefined ? props.isRequired : false;
    const requiredLabel = renderRequiredLabel(required);

    return (
        <div className="input-panel">

            {combo_label}

            <div style={{ float: 'left' }}>

                <select id={id} required={required} value={selectedValue} onChange={handleChange}>
                    {values.map((step, i) => {
                        return <option key={generateUuid()} value={step.value}>{step.label}</option>
                    })}
                </select>

            </div>

            {requiredLabel}

        </div>
    );

}