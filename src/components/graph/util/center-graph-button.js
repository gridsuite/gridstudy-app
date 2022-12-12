/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import CenterFocusIcon from '@mui/icons-material/CenterFocusStrong';
import { Tooltip } from '@mui/material';
import React, { useCallback } from 'react';
import { ControlButton, useStore, useReactFlow } from 'react-flow-renderer';
import { useIntl } from 'react-intl';
import { TOOLTIP_DELAY } from '../../../utils/UIconstants';
import { nodeHeight, nodeWidth } from './model-constants';

const CenterGraphButton = ({ currentNode }) => {
    const { setCenter, fitView } = useReactFlow();

    // Use of hook useStore to get tree internal state and retrieve current zoom
    // Must be used inside a child component of the ReactFlow component
    const [, , zoom] = useStore((state) => state.transform);
    const intl = useIntl();

    const focusNode = useCallback(() => {
        // if no selected node, center on Root
        if (currentNode) {
            const x = currentNode.width / 2.0 + currentNode.position.x;
            const y = currentNode.height / 2.0 + currentNode.position.y;
            setCenter(x, y);
        }
    }, [setCenter, currentNode, zoom]);

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
