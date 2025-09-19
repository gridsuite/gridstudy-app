/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { ReactElement } from 'react';
import { Chip } from '@mui/material';
import { useIntl } from 'react-intl';
import { BUILD_STATUS } from 'components/network/constants';
import { mergeSx, type SxStyle } from '@gridsuite/commons-ui';

function getBuildStatusSx(buildStatus: BUILD_STATUS | undefined): SxStyle {
    return (theme) => {
        const bs = theme.node.buildStatus;
        // pick background based on status
        let bg: string;

        switch (buildStatus) {
            case BUILD_STATUS.BUILT:
                bg = bs.success;
                break;
            case BUILD_STATUS.BUILT_WITH_WARNING:
                bg = bs.warning;
                break;
            case BUILD_STATUS.BUILT_WITH_ERROR:
                bg = bs.error;
                break;
            default:
                bg = bs.notBuilt;
                break;
        }

        // only set explicit contrast color when it's the "notBuilt" background
        const shouldSetContrast = bg === bs.notBuilt;

        return {
            background: bg,
            ...(shouldSetContrast ? { color: theme.palette.getContrastText(bg) } : {}),
            '&:hover': {
                backgroundColor: bg,
            },
        };
    };
}

const baseStyle: SxStyle = (theme) =>
    ({
        padding: theme.spacing(1, 0.5),
        fontSize: '12px',
        fontWeight: 400,
        lineHeight: '100%',
    }) as const;

type BuildStatusChipProps = {
    buildStatus?: BUILD_STATUS;
    sx?: SxStyle;
    icon?: ReactElement;
    onClick?: (e: React.MouseEvent) => void;
};

const BuildStatusChip = ({ buildStatus = BUILD_STATUS.NOT_BUILT, sx, icon, onClick }: BuildStatusChipProps) => {
    const intl = useIntl();

    const label = intl.formatMessage({ id: buildStatus });

    return (
        <Chip
            label={label}
            size="small"
            icon={icon}
            onClick={onClick}
            sx={mergeSx(getBuildStatusSx(buildStatus), sx, baseStyle)}
        />
    );
};

export default BuildStatusChip;
