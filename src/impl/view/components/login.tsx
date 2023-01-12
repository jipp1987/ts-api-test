import React, { useRef } from 'react';
import { properties } from "./../../../properties";
import { getTimestampInSeconds } from "./../../../core/utils/helper-utils";

import "./login.css"

interface ILoginProps {
    setToken(params: string): void;
    setRefreshToken(params: string): void;
}

export default function Login(props: ILoginProps) {
    const username: any = useRef<HTMLInputElement>(null);
    const password: any = useRef<HTMLInputElement>(null);

    // Función de login
    const login_fn = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        const requestBody: {} = {
            request_object: { username: username.current.value, password: password.current.value }
        };

        const requestOptions: RequestInit = {
            method: 'POST',
            mode: 'cors',
            cache: 'default',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
                "Access-Control-Allow-Origin": "*"
            },

            body: JSON.stringify(requestBody)
        };

        return await fetch(properties.userUrl + "/login", requestOptions)
            .then(result => result.json())
            .then(
                (result) => {
                    if (result['status_code'] !== undefined && result['status_code'] !== null && result['status_code'] === 200) {
                        // Almaceno los dos tokens: el normal para las consultas y el de solicitud de refrescado
                        sessionStorage.setItem(properties.tokenSessionID, result.response_object["token_jwt"]);
                        sessionStorage.setItem(properties.tokenRefreshSessionID, result.response_object["refresh_token"]);
                        // Importante almacenar también la hora en milisegundos para saber cuándo hay que refrescar el token
                        sessionStorage.setItem(properties.lastTokenTimeSessionID, getTimestampInSeconds().toString());
                        // Utilizo las funciones pasadas como parámetro para forzar el refrescado del componente que tiene a éste como nodo
                        props.setToken(result.response_object["token_jwt"]);
                        props.setRefreshToken(result.response_object["refresh_token"]);
                    } else {
                        alert(result['response_object']);
                    }
                }
            ).catch(error => {
                alert(error.message);
            });
    }

    // Fonmulario
    return (
        <div className="login-wrapper">
            <h1>Please Log In</h1>
            <form method="POST" action="/" onSubmit={(e) => login_fn(e)}>
                <label>
                    <p>Username</p>
                    <input ref={username} type="text" />
                </label>
                <label>
                    <p>Password</p>
                    <input ref={password} type="password" />
                </label>
                <div>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>
    )
}