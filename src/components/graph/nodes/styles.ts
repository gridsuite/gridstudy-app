/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Theme } from '@mui/material';

export const baseNodeStyles = (theme: Theme, direction: 'row' | 'column') => ({
    display: 'flex',
    flexDirection: direction,
    justifyContent: 'space-between',
    p: 1,
    alignItems: 'stretch',
    background: theme.node.common.background,
    borderRadius: '8px',
    overflow: 'hidden',
});

export const selectedBaseNodeStyles = (theme: Theme, direction: 'row' | 'column') => ({
    ...baseNodeStyles(theme, direction),
    background: theme.node.common.selectedBackground,
});

export const interactiveNodeStyles = (theme: Theme, nodeKey: 'modification' | 'root') => ({
    '&:hover': {
        background: theme.node.common.background,
        borderColor: theme.node?.[nodeKey]?.hoverBorderColor,
    },
    '&:active': {
        background: theme.node.common.activeBackground,
        borderColor: theme.node?.[nodeKey]?.activeBorderColor,
    },
});
