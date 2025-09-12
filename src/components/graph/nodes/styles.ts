/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LIGHT_THEME, type SxStyle } from '@gridsuite/commons-ui';
import { Theme } from '@mui/material';
import { getLocalStorageTheme } from 'redux/session-storage/local-storage';
import { NODE_HEIGHT, NODE_WIDTH } from './constants';

export const baseNodeStyles = (theme: Theme, direction: 'row' | 'column') =>
    ({
        height: NODE_HEIGHT,
        width: NODE_WIDTH,
        display: 'flex',
        flexDirection: direction,
        justifyContent: 'space-between',
        p: 1,
        alignItems: 'stretch',
        background: theme.node.common.background,
        borderRadius: '8px',
        overflow: 'hidden',
    }) as const satisfies SxStyle;

export const selectedBaseNodeStyles = (theme: Theme, direction: 'row' | 'column') =>
    ({
        ...baseNodeStyles(theme, direction),
        background: theme.node.common.selectedBackground,
    }) as const satisfies SxStyle;

export const interactiveNodeStyles = (theme: Theme, nodeKey: 'modification' | 'root') =>
    ({
        '&:hover': {
            background: theme.node.common.background,
            borderColor: theme.node?.[nodeKey]?.hoverBorderColor,
            boxShadow:
                getLocalStorageTheme() === LIGHT_THEME && nodeKey === 'modification'
                    ? theme.shadows[8]
                    : theme.shadows[12],
        },
        '&:active': {
            background: theme.node.common.activeBackground,
            borderColor: theme.node?.[nodeKey]?.activeBorderColor,
            boxShadow:
                getLocalStorageTheme() === LIGHT_THEME && nodeKey === 'modification'
                    ? theme.shadows[6]
                    : theme.shadows[12],
        },
    }) as const satisfies SxStyle;
