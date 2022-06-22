/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import CenterFocusIcon from '@mui/icons-material/CenterFocusStrong';
import { Tooltip } from '@mui/material';
import React, { useCallback } from 'react';
import {
    ControlButton,
    useStoreState,
    useZoomPanHelper,
} from 'react-flow-renderer';
import { useIntl } from 'react-intl';
import { TOOLTIP_DELAY } from '../../../utils/UIconstants';

const CenterGraphButton = ({ selectedNode }) => {
    const { setCenter } = useZoomPanHelper();

    // Use of hook useStoreState to get tree internal state and retrieve current zoom
    // Must be used inside a child component of the ReactFlow component
    const [, , zoom] = useStoreState((state) => state.transform);
    const intl = useIntl();

    const focusNode = useCallback(() => {
        // if no selected node, center on Root
        const x = selectedNode ? selectedNode.position.x : 0;
        const y = selectedNode ? selectedNode.position.y : 0;
        setCenter(x, y, zoom);
    }, [setCenter, selectedNode, zoom]);

    return (
        <Tooltip
            placement="left"
            title={intl.formatMessage({ id: 'CenterSelectedNode' })}
            arrow
            enterDelay={TOOLTIP_DELAY}
            enterNextDelay={TOOLTIP_DELAY}
        >
            <span>
                <ControlButton
                    onClick={() => {
                        focusNode();
                    }}
                >
                    <CenterFocusIcon />
                </ControlButton>
            </span>
        </Tooltip>
    );
};

export default CenterGraphButton;
