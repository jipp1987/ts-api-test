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