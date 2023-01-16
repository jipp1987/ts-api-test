import { getTimestampInSeconds } from "./helper-utils";
import { properties } from './../../properties';

export const TOKEN_SESSION_ID: string = "jwt-token";
export const TOKEN_REFRESH_SESSION_ID: string = "refresh-jwt-token";
export const LAST_TOKEN_TIME_SESSION_ID: string = "last-token-time";
export const TIME_FOR_REFRESH_TOKEN_IN_MINUTES: number = 30;


/**
 * Devuelve las opciones para llamada de API.
 * 
 * @param api_method POST, DELETE o GET.
 * @param auth_token Token JWT, sea el normal o el de solicitud de refrescado. Si no se pasa como parámetro, se asume que la petición no requiere autenticación.
 * Si se ha establecido el parámetro "requestHeaders", el parámetro "auth_token" será ignorado.
 * @param request_body Cuerpo de la petición (sin serializar en el caso de peticiones json). Se usa sólo para peticiones POST, en cualquier otro tipo se ignora. 
 * Si se pasa null o undefined y es petición POST, se incializará como un objeto JS plano vacío.
 * @param requestHeaders Cabeceras de la petición. Si son undefined, se crearán unas por defecto
 * @returns RequestInit
 */
export function getRequestOptionsForAPICall(api_method: 'POST' | 'GET' | 'DELETE' | 'PUT', auth_token?: string | null, request_body?: any,
    requestHeaders?: HeadersInit): RequestInit {

    // Establecer cabeceras
    if (requestHeaders === undefined) {
        requestHeaders = new Headers();
        requestHeaders.set('Accept', 'application/json');
        requestHeaders.set('Content-Type', 'application/json; charset=utf-8');
        requestHeaders.set('Access-Control-Allow-Origin', '*');

        // Si ha llegado auth_token, añadir cabecera de token JWT 
        if (auth_token !== undefined && auth_token !== null) {
            requestHeaders.set('Authorization', 'Bearer ' + auth_token);
        }
    }

    // Crear opciones de petición
    const requestOptions: RequestInit = {
        method: api_method,
        mode: 'cors',
        cache: 'default',
        headers: requestHeaders,
    };

    // Establecer cuerpo de la petición.
    if (api_method === "POST") {
        // Si no hay request_body, inicializarlo a un objeto plano vacío para peticiones POST.
        if (request_body === undefined || request_body === null) {
            request_body = {};
        }

        requestOptions.body = JSON.stringify(
            request_body
        );
    }

    return requestOptions;
}


/**
     * Envía una petición a la API. 
     * 
     * @param {string} url Dirección de la API. Si null, se utiliza la url asociada al controlador. 
     * @param {RequestOptions} requestOptions Objecto de opciones para la petición.
     * @returns {Promise} Evento asíncrono que a su vez devuelve el resultado de la operación 
     * (que es un objeto RequestResponse con atributos success, status_code y response_object). Dado que devuelve una promesa, la función que llame a ésta 
     * debe emplear then para captura el return interno, es decir, el resultado.
     */
export function callAPI(url: string, requestOptions: RequestInit) {
    // Hacer consulta.
    return fetch(url, requestOptions)
        .then(res => res.json())
        .then(
            (result) => {
                // Result es un objeto RequestResponse con atributos success, status_code y response_object
                return result;
            }
        ).catch((error) => {
            throw error;
        });
}


/**
 * Comprueba si es necesario actualizar el token de JWT. Comprueba si queda menos de un tiempo estipulado en properties para que caduque el token JWT.
 * 
 * @returns true si es necesario, false si no lo es. 
 */
export function isTokenRefreshNeeded(): boolean {
    const previousTimeString: string | null = sessionStorage.getItem(LAST_TOKEN_TIME_SESSION_ID) !== null ?
        sessionStorage.getItem(LAST_TOKEN_TIME_SESSION_ID) : null;

    // Esto no debería suceder por la forma en que está programada la aplicación, pero bueno.
    if (previousTimeString === null) {
        // Error si no se ha detectado una llamada previa
        throw Error("No token!!!");
    } else {
        // El tiempo está almacenado en milisegundos: sumo el tiempo de espera en milisegundos al tiempo anterior y lo comparo con el actual. 
        // Si es mayor, toca refrescar el token.
        const previousTime: number = parseInt(previousTimeString);
        const currentTimestamp: number = getTimestampInSeconds();
        // Tiempo para el refrescado del token. Multiplico por sesenta para pasarlo a timestamp.
        const timeForRefresh: number = TIME_FOR_REFRESH_TOKEN_IN_MINUTES * 60;

        // Si la fecha actual menos la de último refrescado es mayor que el tiempo de espera, solicito un refrescado 
        // para evitar un problema de token expirado. El tiempo de espera debe ser siempre menor que el tiempo de expiración de la api, recomendado la mitad.
        return currentTimestamp - previousTime > timeForRefresh;
    }
}


/**
 * Solicita un refresh del token de autenticadción.
*/
export async function refreshToken(): Promise<boolean> {
    if (isTokenRefreshNeeded()) {
        const requestOptions: RequestInit = getRequestOptionsForAPICall("POST", sessionStorage.getItem(TOKEN_REFRESH_SESSION_ID));

        return await fetch(properties.userUrl + "/refresh_token", requestOptions)
            .then(result => result.json())
            .then(
                (result) => {
                    if (result['status_code'] !== undefined && result['status_code'] !== null && result['status_code'] === 200) {
                        // Important actualizar la hora de último refrescado de token
                        sessionStorage.setItem(TOKEN_SESSION_ID, result.response_object);
                        sessionStorage.setItem(LAST_TOKEN_TIME_SESSION_ID, getTimestampInSeconds().toString());
                        return true;
                    } else {
                        throw new Error(result['response_object']);
                    }
                }
            ).catch(error => {
                throw error;
            });
    } else {
        return false;
    }
}