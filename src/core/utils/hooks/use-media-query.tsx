import { useEffect, useState } from "react";

/**
 * Calcula un ancho apropiado para el componente de acuerdo con el tamaño de la ventana y considerando un ancho mínimo deseado.
 * 
 * @param minWidth Ancho mínimo.
 * @returns Ancho deseado.
 */
const useMediaQuery = (minWidth: number) => {
    const [state, setState] = useState({
        windowWidth: window.innerWidth,
        isDesiredWidth: false,
    });

    useEffect(() => {
        const resizeHandler = () => {
            const currentWindowWidth = window.innerWidth;
            const isDesiredWidth = currentWindowWidth < minWidth;
            setState({ windowWidth: currentWindowWidth, isDesiredWidth });
        };
        window.addEventListener("resize", resizeHandler);
        return () => window.removeEventListener("resize", resizeHandler);
        // eslint-disable-next-line
    }, [state.windowWidth]);

    return state.isDesiredWidth;
};

export default useMediaQuery;