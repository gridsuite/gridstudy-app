/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Tooltip } from '@mui/material';
import React from 'react';
import { ControlButton } from '@xyflow/react';
import { useIntl } from 'react-intl';
import { TOOLTIP_DELAY } from '../../../utils/UIconstants';

const TreeControlButton = ({
    onClick,
    titleId,
    children,
}: {
    onClick: () => void;
    titleId: string;
    children: React.ReactNode;
}) => {
    const intl = useIntl();
    return (
        <Tooltip
            placement="left"
            title={intl.formatMessage({ id: titleId })}
            arrow
            enterDelay={TOOLTIP_DELAY}
            enterNextDelay={TOOLTIP_DELAY}
        >
            <span>
                <ControlButton onClick={onClick}>{children}</ControlButton>
            </span>
        </Tooltip>
    );
};

export default TreeControlButton;
