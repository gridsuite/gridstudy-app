/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { type MuiStyles } from '@gridsuite/commons-ui';

export const parametersStyles = {
    parameterName: (theme) => ({
        fontWeight: 'bold',
        marginTop: theme.spacing(1),
    }),
    scrollableGrid: (theme) => ({
        overflowY: 'auto',
        overflowX: 'hidden',
        maxHeight: '85%', // TODO This needs to be refactored
        paddingRight: theme.spacing(2),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(1),
        flexGrow: 1,
    }),
    controlItem: {
        justifyContent: 'flex-end',
        flexGrow: 1,
    },
    controlParametersItem: {
        justifyContent: 'flex-start',
        flexGrow: 1,
        height: 'fit-content',
        paddingBottom: 4,
    },
    marginTopButton: {
        marginTop: '10px',
        position: 'sticky',
        bottom: 0,
    },
    panel: (theme) => ({
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
    }),
    title: (theme) => ({
        padding: theme.spacing(2),
    }),
} as const satisfies MuiStyles;
