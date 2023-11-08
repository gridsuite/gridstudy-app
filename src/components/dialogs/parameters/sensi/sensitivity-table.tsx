/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import React, { FunctionComponent, useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFormContext } from 'react-hook-form';
import { Box } from '@mui/system';
import TableRowComponent from './table-row';
import { DARK_THEME } from '@gridsuite/commons-ui';
import { getLocalStorageTheme } from '../../../../redux/local-storage';

export const MAX_ROWS_NUMBER = 100;

interface SensitivityTableProps {
    arrayFormName: string;
    useFieldArrayOutput: any;
    columnsDefinition: any;
    tableHeight: number;
    createRows: (a: number) => void;
}
const SensitivityTable: FunctionComponent<SensitivityTableProps> = ({
    arrayFormName,
    useFieldArrayOutput,
    columnsDefinition,
    tableHeight,
    createRows,
}) => {
    const intl = useIntl();
    const theme = getLocalStorageTheme() === DARK_THEME;
    const { getValues } = useFormContext();
    const { fields: currentRows, append, remove } = useFieldArrayOutput;

    const handleAddRowsButton = useCallback(() => {
        if (currentRows.length >= MAX_ROWS_NUMBER) {
            return;
        }
        append(createRows(1));
    }, [append, createRows, currentRows.length]);

    const handleDeleteButton = useCallback(
        (index: number) => {
            const currentRowsValues = getValues(arrayFormName);
            if (index >= 0 && index < currentRowsValues.length) {
                remove(index);
            }
        },
        [arrayFormName, getValues, remove]
    );

    return (
        <TableContainer
            sx={{
                height: tableHeight,
                border: 'solid 0px rgba(0,0,0,0.1)',
            }}
        >
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        {columnsDefinition.map((column: any) => (
                            <TableCell>
                                <Box
                                    sx={{
                                        backgroundColor: column.color,
                                    }}
                                >
                                    <FormattedMessage id={column.label} />
                                </Box>
                            </TableCell>
                        ))}
                        <TableCell>
                            <Tooltip
                                title={intl.formatMessage({
                                    id: 'AddRows',
                                })}
                            >
                                <Box>
                                    <IconButton
                                        color="primary"
                                        onClick={handleAddRowsButton}
                                    >
                                        <AddCircleIcon
                                            sx={{
                                                color:
                                                    getLocalStorageTheme() ===
                                                    DARK_THEME
                                                        ? 'white'
                                                        : 'black',
                                            }}
                                        />
                                    </IconButton>
                                </Box>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {currentRows.map((row: any, index: number) => (
                        <TableRowComponent
                            arrayFormName={arrayFormName}
                            columnsDefinition={columnsDefinition}
                            row={row}
                            index={index}
                            handleDeleteButton={handleDeleteButton}
                            theme={theme}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default SensitivityTable;
