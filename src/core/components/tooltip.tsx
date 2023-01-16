import { Tooltip as ReactTooltip } from "react-tooltip";

import "react-tooltip/dist/react-tooltip.css";

interface ITooltipProps {
    text: string;
    parentId: string;
}

export default function Tooltip(props: ITooltipProps) {

    return (
        <ReactTooltip
            anchorId={props.parentId}
            place="bottom"
            content={props.text}
        />
    );

}