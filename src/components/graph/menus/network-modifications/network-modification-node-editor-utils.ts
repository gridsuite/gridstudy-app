/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Theme } from '@mui/material';

export const styles = {
    listContainer: (theme: Theme) => ({
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        paddingBottom: theme.spacing(8),
    }),
    listItem: { paddingLeft: 0, paddingTop: 0, paddingBottom: 0 },
    checkBoxLabel: { flexGrow: '1' },
    disabledModification: { opacity: 0.4 },
    checkBoxIcon: { minWidth: 0, padding: 0 },
    checkboxButton: {
        padding: 0,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
    },
    modificationsTitle: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        margin: theme.spacing(0),
        padding: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        overflow: 'hidden',
    }),
    toolbar: (theme: Theme) => ({
        '&': {
            // Necessary to overrides some @media specific styles that are defined elsewhere
            padding: 0,
            minHeight: 0,
        },
        border: theme.spacing(1),
        margin: 0,
        flexShrink: 0,
    }),
    toolbarIcon: (theme: Theme) => ({
        marginRight: theme.spacing(1),
    }),
    toolbarCheckbox: (theme: Theme) => ({
        marginLeft: theme.spacing(1.5),
    }),
    filler: {
        flexGrow: 1,
    },
    circularProgress: (theme: Theme) => ({
        marginRight: theme.spacing(2),
        color: theme.palette.primary.contrastText,
    }),
    toolbarCircularProgress: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: theme.spacing(1.25),
        marginRight: theme.spacing(2),
        color: theme.palette.secondary.main,
    }),
    notification: (theme: Theme) => ({
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing(4),
        textAlign: 'center',
        color: theme.palette.primary.main,
    }),
    icon: (theme: Theme) => ({
        width: theme.spacing(3),
    }),
    iconEdit: (theme: Theme) => ({
        marginRight: theme.spacing(1),
    }),
};

export function isChecked(s1: number) {
    return s1 !== 0;
}

export function isPartial(s1: number, s2: number) {
    if (s1 === 0) {
        return false;
    }
    return s1 !== s2;
}
