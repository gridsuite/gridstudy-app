/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { type MuiStyles } from '@gridsuite/commons-ui';
import { Theme } from '@mui/material';
import { baseNodeStyles, interactiveNodeStyles } from './styles';
import { zoomStyles } from '../zoom.styles';

export const getBorderWidthStyle = (theme: Theme, isSelected: boolean) => ({
    borderWidth: zoomStyles.borderWidth(theme, isSelected),
});

export const getNodeBaseStyle = (theme: Theme, isSelected: boolean) =>
    isSelected ? modificationNodeStyles.selected(theme) : modificationNodeStyles.default(theme);

export const modificationNodeStyles = {
    selected: (theme) => ({
        ...baseNodeStyles(theme, 'column'),
        background: theme.node.modification.selectedBackground,
        border: theme.node.modification.selectedBorder,
        boxShadow: theme.shadows[6],
        ...interactiveNodeStyles(theme, 'modification'),
    }),

    default: (theme) => ({
        ...baseNodeStyles(theme, 'column'),
        border: theme.node.modification.border,
        ...interactiveNodeStyles(theme, 'modification'),
    }),

    contentBox: (theme) => ({
        flexGrow: 1,
        display: zoomStyles.visibility.showNodeContent(theme) ? 'flex' : 'none',
        alignItems: 'flex-end',
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
    }),

    typographyText: (theme) => ({
        color: theme.palette.text.primary,
        fontSize: '20px',
        fontWeight: 400,
        lineHeight: 'normal',
        textAlign: 'left',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        overflow: 'hidden',
        width: 'auto',
        textOverflow: 'ellipsis',
        wordBreak: 'break-word',
    }),

    footer: (theme) => ({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        height: zoomStyles.layout.useFullHeightFooter(theme) ? '100%' : '35%',
    }),

    chipFloating: (theme) => ({
        position: 'absolute',
        top: theme.spacing(-4.3),
        left: theme.spacing(1),
        zIndex: 2,
    }),

    chipLarge: (theme) => zoomStyles.layout.getLargeChipSize(theme) ?? {},

    buildButtonContainer: (theme) => ({
        display: zoomStyles.visibility.showBuildButton(theme) ? 'block' : 'none',
    }),

    globalBuildStatusIcon: (theme) => ({
        fontSize: zoomStyles.iconSize(theme),
        '& path': {
            stroke: `currentColor`,
            strokeWidth: `${zoomStyles.iconStrokeWidth(theme)}px`,
        },
    }),

    tooltip: {
        maxWidth: '720px',
    },
} as const satisfies MuiStyles;
