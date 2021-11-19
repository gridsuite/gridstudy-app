import CenterFocusIcon from '@material-ui/icons/CenterFocusStrong';
import React from 'react';
import { ControlButton, useZoomPanHelper } from 'react-flow-renderer';

const CenterGraphButton = () => {
    const { setCenter } = useZoomPanHelper();

    const focusNode = (x, y) => {
        const zoom = 1.85;
        setCenter(x, y, zoom);
    };

    return (
        <ControlButton
            onClick={() => {
                focusNode(0, 0);
            }}
        >
            <CenterFocusIcon />
        </ControlButton>
    );
};

export default CenterGraphButton;
