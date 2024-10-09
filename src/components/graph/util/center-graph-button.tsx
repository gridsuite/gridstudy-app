/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import CenterFocusIcon from '@mui/icons-material/CenterFocusStrong';
import { Tooltip } from '@mui/material';
import React, { useCallback } from 'react';
import { ControlButton, useReactFlow } from 'reactflow';
import { useIntl } from 'react-intl';
import { TOOLTIP_DELAY } from '../../../utils/UIconstants';
import { CurrentTreeNode } from 'redux/reducer';

const CenterGraphButton = ({ currentNode }: { currentNode: CurrentTreeNode }) => {
    const { setCenter, getZoom } = useReactFlow();
    const intl = useIntl();

    const focusNode = useCallback(() => {
        const width = (currentNode.style?.width ?? 0) as number;
        const x = width / 2.0 + currentNode.position.x;
        const height = (currentNode.style?.height ?? 0) as number;
        const y = height / 2.0 + currentNode.position.y;

        setCenter(x, y, { zoom: getZoom() });
    }, [setCenter, currentNode, getZoom]);

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
