/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { type MuiStyles } from '@gridsuite/commons-ui';
import { colors, Theme } from '@mui/material';
import { zoomStyles } from '../zoom.styles';

export const LABEL_GROUP_OFFSET = 30;

export const getContainerStyle = (theme: Theme, isLight: boolean) => {
    let backgroundColor = 'transparent';
    if (theme.tree?.is.minimalDetail) {
        backgroundColor = isLight ? theme.palette.grey[200] : colors.grey[700];
    }

    return {
        ...zoomStyles.labeledGroupBorder(theme),
        background: backgroundColor,
        borderColor: isLight ? colors.grey[400] : colors.grey[500],
    };
};

export const labeledGroupNodeStyles = {
    label: (theme) => ({
        position: 'absolute',
        top: -15,
        right: 20,
        backgroundColor: theme.reactflow.labeledGroup.backgroundColor,
        padding: '3px 6px',
        border: '1px solid',
        borderColor: theme.reactflow.labeledGroup.borderColor,
        boxShadow: theme.shadows[1],
        fontSize: '12px',
        display: theme.tree?.atMost.minimalDetail ? 'none' : 'flex',
        gap: '4px',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
    }),

    icon: (theme) => ({
        fontSize: zoomStyles.iconSize(theme),
        verticalAlign: 'middle',
    }),

    text: (theme) => ({
        display: theme.tree?.atLeast.standardDetail ? 'inline' : 'none',
        verticalAlign: 'middle',
    }),
} as const satisfies MuiStyles;
