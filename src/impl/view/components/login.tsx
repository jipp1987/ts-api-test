import React, { useRef, useEffect, useState } from 'react';
import { properties } from "./../../../properties";
import { getTimestampInSeconds } from "./../../../core/utils/helper-utils";
import {
    getRequestOptionsForAPICall, TOKEN_SESSION_ID, TOKEN_REFRESH_SESSION_ID, LAST_TOKEN_TIME_SESSION_ID
} from "./../../../core/utils/api-utils";

import "./login.css"

interface ILoginProps {
    setToken(params: string): void;
    setRefreshToken(params: string): void;
}

export default function Login(props: ILoginProps) {
    const username: any = useRef<HTMLInputElement>(null);
    const password: any = useRef<HTMLInputElement>(null);

    // Mientras busca el usuario, utilizar un boolean para repintar el formulario
    const [loading, setLoading] = useState<boolean>(false);
    // Otro para mostrar un texto de error
    const [error, setError] = useState<string | null>(null);

    // Establecer foco en la carga del componente mediante un hook
    useEffect(() => {
        username.current.focus();
    }, []);

    // Función de login
    const login_fn = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        // Activo loading para mostrar un texto en algún sitio.
        setLoading(true);
        setError(null);

        // El cuerpo de la petición espera un objeto plano "request_object" con dos atributos: username y password.
        const requestBody: {} = {
            request_object: { username: username.current.value, password: password.current.value }
        };

        // Opciones de la petición.
        const requestOptions: RequestInit = getRequestOptionsForAPICall("POST", null, requestBody);

        return await fetch(properties.userUrl + "/login", requestOptions)
            .then(result => result.json())
            .then(
                (result) => {
                    if (result['status_code'] !== undefined && result['status_code'] !== null && result['status_code'] === 200) {
                        // Almaceno los dos tokens: el normal para las consultas y el de solicitud de refrescado
                        sessionStorage.setItem(TOKEN_SESSION_ID, result.response_object["token_jwt"]);
                        sessionStorage.setItem(TOKEN_REFRESH_SESSION_ID, result.response_object["refresh_token"]);

                        // Importante almacenar también la hora en milisegundos para saber cuándo hay que refrescar el token
                        sessionStorage.setItem(LAST_TOKEN_TIME_SESSION_ID, getTimestampInSeconds().toString());

                        // Utilizo las funciones pasadas como parámetro para forzar el refrescado del componente que tiene a éste como nodo
                        props.setToken(result.response_object["token_jwt"]);
                        props.setRefreshToken(result.response_object["refresh_token"]);
                    } else {
                        setError(result['response_object']);
                    }
                }
            ).catch(error => {
                setError(error.message);
            }).finally(() => {
                setLoading(false);
            });
    }

    // Texto de carga
    const loading_text: string = loading ? "Loading..." : "Login";

    // Mensaje de error
    const error_message: React.ReactNode | null = error !== null ?
        <div className="input-parent">
            <span style={{ color: "red", fontWeight: "bold", fontSize: "12px" }}>{error}</span>
        </div>
        : null;

    // Fonmulario
    return (
        <div className="login-wrapper">
            <form id="loginForm" method="POST" action="/" onSubmit={(e: React.FormEvent<HTMLFormElement>) => login_fn(e)}>
                <h2>Welcome</h2>

                <div className="input-parent">
                    <label htmlFor="username">Username</label>
                    <input ref={username} type="text" id="username" disabled={loading} required={true} />
                </div>

                <div className="input-parent">
                    <label htmlFor="password">Password</label>
                    <input ref={password} type="password" id="password" disabled={loading} required={true} />
                </div>

                {error_message}

                <button type="submit" className='login-button' disabled={loading}>{loading_text}</button>

            </form>
        </div>
    )
}