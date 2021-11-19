import CenterFocusIcon from '@material-ui/icons/CenterFocusStrong';
import React, { useCallback } from 'react';
import { ControlButton, useZoomPanHelper } from 'react-flow-renderer';

const CenterGraphButton = ({ selectedNode }) => {
    const { setCenter } = useZoomPanHelper();

    const focusNode = useCallback(() => {
        // if no selected node, center on Root
        const x = selectedNode ? selectedNode.position.x : 0;
        const y = selectedNode ? selectedNode.position.y : 0;
        const zoom = 1;
        setCenter(x, y, zoom);
    }, [setCenter, selectedNode]);

    return (
        <ControlButton
            onClick={() => {
                focusNode();
            }}
        >
            <CenterFocusIcon />
        </ControlButton>
    );
};

export default CenterGraphButton;
