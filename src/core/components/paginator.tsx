import ImageButton from "./image-button";

import "./styles/paginator.css";

/**
 * Propiedades del componente.
 */
interface IPaginatorProps {
    /**
     * Acción click botón página siguiente.
     */
    nextPageAction(): void;
    /**
     * Acción click botón página anterior.
     */
    previousPageAction(): void;
    /**
     * Acción click botón primera página.
     */
    firstPageAction(): void;
    /**
     * Acción click botón última página.
     */
    lastPageAction(): void;
}

/**
 * Paginador para tablas.
 * 
 * @param props 
 * @returns Componente React. 
 */
export default function Paginator(props: IPaginatorProps) {

    return (
        <div className="paginator-wrapping">

            <ImageButton className="first-button" onClick={() => props.firstPageAction()} />

            <ImageButton className="previous-button" onClick={() => props.previousPageAction()} />
            
            <ImageButton className="next-button" onClick={() => props.nextPageAction()} />
            
            <ImageButton className="last-button" onClick={() => props.lastPageAction()} />

        </div>
    );

}