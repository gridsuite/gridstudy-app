/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { ReactElement } from 'react';
import { Chip, useTheme } from '@mui/material';
import { useIntl } from 'react-intl';
import { BUILD_STATUS } from 'components/network/constants';
import { mergeSx, type SxStyle } from '@gridsuite/commons-ui';
import { zoomStyles } from '../zoom.styles';
import { buildStatusChipStyles } from './build-status-chip.styles';

function getBuildStatusColor(buildStatus: BUILD_STATUS | undefined) {
    switch (buildStatus) {
        case BUILD_STATUS.BUILT:
            return 'success';
        case BUILD_STATUS.BUILT_WITH_WARNING:
            return 'warning';
        case BUILD_STATUS.BUILT_WITH_ERROR:
            return 'error';
        default:
            return undefined;
    }
}

type BuildStatusChipProps = {
    buildStatus?: BUILD_STATUS;
    sx?: SxStyle;
    icon?: ReactElement;
    onClick?: (e: React.MouseEvent) => void;
};

const BuildStatusChip = ({ buildStatus = BUILD_STATUS.NOT_BUILT, sx, icon, onClick }: BuildStatusChipProps) => {
    const intl = useIntl();
    const theme = useTheme();

    const showLabel = zoomStyles.visibility.showBuildStatusLabel(theme);
    const label = showLabel ? intl.formatMessage({ id: buildStatus }) : undefined;
    const color = getBuildStatusColor(buildStatus);

    // Custom styling for NOT_BUILT status (no standard MUI color)
    const notBuiltSx: SxStyle | undefined = color === undefined ? buildStatusChipStyles.notBuilt : undefined;

    // Combine styles: base + compact circular (if no label) + notBuilt color + parent overrides
    const finalSx = mergeSx(
        buildStatusChipStyles.base,
        showLabel ? undefined : (theme) => zoomStyles.layout.getCompactChipSize(theme),
        notBuiltSx,
        sx
    );

    return <Chip label={label} size="small" icon={icon} onClick={onClick} color={color} sx={finalSx} />;
};

export default BuildStatusChip;
