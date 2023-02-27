/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import makeStyles from '@mui/styles/makeStyles';

export const useStyles = makeStyles((theme) => ({
    title: {
        padding: theme.spacing(2),
    },
    grid: {
        paddingTop: theme.spacing(2),
        padding: theme.spacing(0),
        flexGrow: 1,
    },
    minWidthMedium: {
        minWidth: theme.spacing(20),
    },
    controlItem: {
        justifyContent: 'flex-end',
    },
    button: {
        marginBottom: theme.spacing(2),
        marginLeft: theme.spacing(1),
    },
    advancedParameterButton: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(1),
    },
    marginTopButton: {
        marginTop: 10,
    },
}));
