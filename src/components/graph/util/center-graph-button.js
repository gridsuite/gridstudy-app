/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
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
