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
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { MAX_ROWS_NUMBER } from '../../../utils/dnd-table/dnd-table';
import { useFormContext } from 'react-hook-form';
import { Box } from '@mui/system';
import TableRowComponent from './table-row';

const SensitivityTable = ({
    arrayFormName,
    useFieldArrayOutput,
    columnsDefinition,
    tableHeight,
    createRows,
}) => {
    const intl = useIntl();
    const { getValues, setError, clearErrors } = useFormContext();

    const { fields: currentRows, append, remove } = useFieldArrayOutput;

    function handleAddRowsButton() {
        let numberOfRows = 1;
        if (currentRows.length + 1 > MAX_ROWS_NUMBER) {
            setError(arrayFormName, {
                type: 'custom',
                message: {
                    id: 'MaximumRowNumberError',
                    value: MAX_ROWS_NUMBER,
                },
            });
            return;
        }
        clearErrors(arrayFormName);

        const rowsToAdd = createRows(numberOfRows).map((row) => ({ ...row }));
        append(rowsToAdd);
    }

    function handleDeleteButton(index) {
        const currentRowsValues = getValues(arrayFormName);
        if (index >= 0 && index < currentRowsValues.length) {
            remove(index);
        }
    }

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
                        {columnsDefinition.map((column) => (
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
                                        onClick={() => handleAddRowsButton()}
                                    >
                                        <AddCircleIcon
                                            sx={{ color: 'white' }}
                                        />
                                    </IconButton>
                                </Box>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {currentRows.map((row, index) => (
                        <TableRowComponent
                            arrayFormName={arrayFormName}
                            columnsDefinition={columnsDefinition}
                            row={row}
                            index={index}
                            handleDeleteButton={handleDeleteButton}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default SensitivityTable;
