import React from 'react';
import { usePromiseTracker } from "react-promise-tracker";
import { FormattedMessage } from "react-intl";

import Modal from "./modal";

import loading from './../resources/loading.gif'

/**
 * Propiedades del componente.
 */
interface ILoadingIndicatorProps {
    parentContainer?: string;
}

/**
 * Rastreador de promesas para mantener un indicador modal de "waitstatus", de tal manera que cuando se está haciendo 
 * alguna tarea se bloquee la aplicación.
 * 
 * @param {*} props 
 * @returns LoadingIndicator
 */
export default function LoadingIndicator(props: ILoadingIndicatorProps) {
    const { promiseInProgress } = usePromiseTracker();

    if (promiseInProgress) {
        return <Modal title={<FormattedMessage id="i18n_common_loading" />}
            parentContainer={props.parentContainer}>
            <div
                style={{
                    width: "100%",
                    height: "100",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <img src={loading} alt="loading..." />

            </div>
        </Modal>
    } else {
        return null;
    }
};