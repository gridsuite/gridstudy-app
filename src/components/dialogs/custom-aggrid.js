/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { makeStyles, useTheme } from '@mui/styles';
import { AgGridReact } from 'ag-grid-react';
import clsx from 'clsx';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const useStyles = makeStyles(() => ({
    grid: {
        width: 'auto',
        height: '100%',
        position: 'relative',
    },
}));

export const CustomAGGrid = (props) => {
    const theme = useTheme();
    const classes = useStyles();
    const intl = useIntl();

    const GRID_PREFIX = 'grid.';

    const getLocaleText = useCallback(
        (params) => {
            const key = GRID_PREFIX + params.key;
            return intl.messages[key] || params.defaultValue;
        },
        [intl]
    );

    return (
        <div className={clsx([theme.aggrid, classes.grid])}>
            <AgGridReact getLocaleText={getLocaleText} {...props} />
        </div>
    );
};
