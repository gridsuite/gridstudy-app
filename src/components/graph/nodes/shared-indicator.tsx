/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Tooltip } from '@mui/material';
import { DatasetLinked } from '@mui/icons-material';
import { ReactFlowState, useStore } from '@xyflow/react';
import { FormattedMessage } from 'react-intl';
import { type MuiStyles } from '@gridsuite/commons-ui';
import { TOOLTIP_DELAY } from 'utils/UIconstants';

// under this zoom level, the label is hidden and only the icon (with a tooltip) is displayed
const SHARED_LABEL_MIN_ZOOM = 0.5;

const styles = {
    indicator: (theme) => ({
        position: 'absolute',
        top: theme.spacing(-4),
        right: theme.spacing(1),
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '2px 6px',
        fontSize: 12,
        backgroundColor: theme.reactflow.labeledGroup.backgroundColor,
        border: '1px solid',
        borderColor: theme.reactflow.labeledGroup.borderColor,
        color: theme.palette.text.primary,
    }),
} as const satisfies MuiStyles;

type SharedIndicatorProps = {
    // translation id of the tooltip displayed when only the icon is shown
    tooltipId: string;
};

export function SharedIndicator({ tooltipId }: Readonly<SharedIndicatorProps>) {
    const zoom = useStore((s: ReactFlowState) => s.transform?.[2] ?? 1);

    if (zoom >= SHARED_LABEL_MIN_ZOOM) {
        return (
            <Box sx={styles.indicator}>
                <DatasetLinked sx={{ fontSize: '16px' }} />
                <FormattedMessage id="sharedNodeIndicator" />
            </Box>
        );
    }

    return (
        <Tooltip
            title={<FormattedMessage id={tooltipId} />}
            arrow
            placement="top"
            enterDelay={TOOLTIP_DELAY}
            enterNextDelay={TOOLTIP_DELAY}
        >
            <Box sx={styles.indicator}>
                <DatasetLinked sx={{ fontSize: '16px' }} />
            </Box>
        </Tooltip>
    );
}
