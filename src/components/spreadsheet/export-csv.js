/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, IconButton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { FormattedMessage, useIntl } from 'react-intl';
import GetAppIcon from '@mui/icons-material/GetApp';
import { useCallback } from 'react';

const useStyles = makeStyles((theme) => ({
    exportCsv: {
        marginTop: theme.spacing(2),
        marginLeft: theme.spacing(6),
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'baseline',
        position: 'absolute',
        right: 0,
    },
}));

export const CsvExport = ({ gridRef, tableName, disabled }) => {
    const classes = useStyles();
    const intl = useIntl();

    const getCSVFilename = useCallback(() => {
        const localisedTabName = intl.formatMessage({ id: tableName });
        return localisedTabName
            .trim()
            .replace(/[\\/:"*?<>|\s]/g, '-') // Removes the filesystem sensible characters
            .substring(0, 27); // Best practice : limits the filename size to 31 characters (27+'.csv')
    }, [intl, tableName]);

    const downloadCSVData = useCallback(() => {
        gridRef?.current?.api?.exportDataAsCsv({
            suppressQuotes: true,
            fileName: getCSVFilename(),
        });
    }, [getCSVFilename, gridRef]);

    return (
        <Grid item className={classes.exportCsv}>
            <span
                className={clsx({
                    [classes.disabledLabel]: disabled,
                })}
            >
                <FormattedMessage id="MuiVirtualizedTable/exportCSV" />
            </span>
            <span>
                <IconButton
                    disabled={disabled}
                    aria-label="exportCSVButton"
                    onClick={downloadCSVData}
                >
                    <GetAppIcon />
                </IconButton>
            </span>
        </Grid>
    );
};
