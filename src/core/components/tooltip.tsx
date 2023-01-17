import React, { useState } from "react";

import "./styles/tooltip.css";

interface ITooltipProps {
    delay?: number;
    children: React.ReactNode;
    content: React.ReactNode;
    direction?: "top" | "bottom" | "left" | "right";
}

/**
 * Componente de tooltip.
 * 
 * @param props 
 * @returns 
 */
export default function Tooltip(props: ITooltipProps) {
    let timeout: NodeJS.Timeout;
    const [active, setActive] = useState(false);

    const showTip = () => {
        timeout = setTimeout(() => {
            setActive(true);
        }, props.delay || 400);
    };

    const hideTip = () => {
        clearInterval(timeout);
        setActive(false);
    };

    return (
        <div
            className="Tooltip-Wrapper"
            // Cuando mostrar el tooltip
            onMouseEnter={showTip}
            onMouseLeave={hideTip}
        >
            {/* Envoltorio del tooltip */}
            {props.children}
            {active && (
                <div className={`Tooltip-Tip ${props.direction || "top"}`}>
                    {/* Contenido del tooltip */}
                    {props.content}
                </div>
            )}
        </div>
    );
}