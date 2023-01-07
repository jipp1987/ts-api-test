import React from "react";

/**
 * Tipo custom para funciones de validación.
 */
export declare type VALIDATION_FUNCTION_TYPE = (params?: any) => string | boolean | React.ReactNode | Promise<any> | null;

/**
 * Clase de modelado para función de validación durante el envío del formulario.
 */
export class ValidationFunction {

    /**
     * Función de validación que se va a llamar.
     */
    callback: VALIDATION_FUNCTION_TYPE;
    /**
     * Parámetros de la función. 
     */ 
    functionParams?: Array<any>

    constructor(callback: VALIDATION_FUNCTION_TYPE, functionParams?: Array<any>) {
        this.callback = callback;
        this.functionParams = functionParams;
    }

}