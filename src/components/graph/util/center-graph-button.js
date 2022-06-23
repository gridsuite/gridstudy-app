/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import CenterFocusIcon from '@mui/icons-material/CenterFocusStrong';
import React, { useCallback } from 'react';
import {
    ControlButton,
    useStoreState,
    useZoomPanHelper,
} from 'react-flow-renderer';

const CenterGraphButton = ({ currentNode }) => {
    const { setCenter } = useZoomPanHelper();

    // Use of hook useStoreState to get tree internal state and retrieve current zoom
    // Must be used inside a child component of the ReactFlow component
    const [, , zoom] = useStoreState((state) => state.transform);

    const focusNode = useCallback(() => {
        // if no selected node, center on Root
        const x = currentNode ? currentNode.position.x : 0;
        const y = currentNode ? currentNode.position.y : 0;
        setCenter(x, y, zoom);
    }, [setCenter, currentNode, zoom]);

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
