/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { ReactElement } from 'react';
import { Chip, SxProps, Theme } from '@mui/material';
import { useIntl } from 'react-intl';
import { BUILD_STATUS } from 'components/network/constants';

function getBuildStatusSx(buildStatus: BUILD_STATUS | undefined): SxProps<Theme> {
    return (theme: Theme) => {
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
        const contrast = shouldSetContrast ? theme.palette.getContrastText(bg) : undefined;

        return {
            background: bg,
            ...(shouldSetContrast ? { color: contrast } : {}),
            '&:hover': {
                backgroundColor: bg,
            },
        };
    };
}

const baseStyle = {
    padding: (theme: Theme) => theme.spacing(1, 0.5),
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '100%',
};

type BuildStatusChipProps = {
    buildStatus?: BUILD_STATUS;
    sx?: SxProps<Theme>;
    icon?: ReactElement;
    onClick?: (e: React.MouseEvent) => void;
};

const BuildStatusChip = ({ buildStatus, sx, icon, onClick }: BuildStatusChipProps) => {
    const intl = useIntl();

    // Normalize user-provided sx into an array without falsy items.
    const normalizeSxArray = (inSx?: SxProps<Theme>): SxProps<Theme>[] => {
        if (!inSx) {
            return [];
        }
        if (Array.isArray(inSx)) {
            return (inSx as unknown[]).filter(Boolean) as SxProps<Theme>[];
        }
        return [inSx];
    };

    const userSxArray = normalizeSxArray(sx);

    const finalSx = [getBuildStatusSx(buildStatus), ...userSxArray, baseStyle] as SxProps<Theme>;

    const label = buildStatus ? intl.formatMessage({ id: buildStatus }) : '';

    return <Chip label={label} size="small" icon={icon} onClick={onClick} sx={finalSx} />;
};

export default BuildStatusChip;
