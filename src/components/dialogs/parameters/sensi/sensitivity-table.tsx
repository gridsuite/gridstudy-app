/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import React, { FunctionComponent, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { UseFieldArrayReturn, useFormContext } from 'react-hook-form';
import TableRowComponent from './table-row';
import { IColumnsDef } from './columns-definitions';
import {
    ACTIVATED,
    HVDC_LINES,
    INJECTIONS,
    MONITORED_BRANCHES,
    PSTS,
} from '../../../utils/field-constants';

export const MAX_ROWS_NUMBER = 100;

interface SensitivityTableProps {
    arrayFormName: string;
    useFieldArrayOutput: UseFieldArrayReturn;
    columnsDefinition: IColumnsDef[];
    tableHeight: number;
    createRows: (a: number) => void;
    disableAdd?: boolean;
    disableDelete?: boolean;
    onFormChanged: (a: boolean) => void;
    onChangeParams: (a: Record<string, any>, b: string, c: number) => void;
}
const SensitivityTable: FunctionComponent<SensitivityTableProps> = ({
    arrayFormName,
    useFieldArrayOutput,
    columnsDefinition,
    tableHeight,
    createRows,
    disableAdd,
    disableDelete,
    onFormChanged,
    onChangeParams,
}) => {
    const intl = useIntl();
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
            onFormChanged(true);
        },
        [arrayFormName, getValues, remove, onFormChanged]
    );

    const fetchCount = useCallback(
        (arrayFormName: string, index: number) => {
            let row = getValues(arrayFormName)[index];
            if (
                row[ACTIVATED] &&
                row[MONITORED_BRANCHES].length &&
                (row[INJECTIONS]?.length ||
                    row[HVDC_LINES]?.length ||
                    row[PSTS]?.length)
            ) {
                onChangeParams(row, arrayFormName, index);
            }
        },
        [onChangeParams, getValues]
    );

    return (
        <TableContainer
            sx={{
                height: tableHeight,
                border: 'solid 0px rgba(0,0,0,0.1)',
            }}
        >
            <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                    {columnsDefinition.map((column: IColumnsDef) => (
                        <TableCell
                            key={column.dataKey}
                            sx={{ width: column.width, textAlign: 'center' }}
                        >
                            <Box>{column.label}</Box>
                        </TableCell>
                    ))}
                    <TableCell sx={{ width: '5rem', textAlign: 'center' }}>
                        <Tooltip
                            title={intl.formatMessage({
                                id: 'AddRows',
                            })}
                        >
                            <IconButton
                                disabled={disableAdd}
                                onClick={handleAddRowsButton}
                            >
                                <AddCircleIcon />
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                </TableHead>
                <TableBody>
                    {currentRows.map(
                        (row: Record<'id', string>, index: number) => (
                            <TableRowComponent
                                arrayFormName={arrayFormName}
                                columnsDefinition={columnsDefinition}
                                row={row}
                                index={index}
                                handleDeleteButton={handleDeleteButton}
                                disableDelete={disableDelete}
                                onFormChanged={onFormChanged}
                                fetchCount={fetchCount}
                            />
                        )
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default SensitivityTable;
