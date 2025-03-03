/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { ErrorInput, FieldErrorAlert } from '@gridsuite/commons-ui';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { SELECTED } from '../../utils/field-constants';
import { TableNumericalInput } from '../../utils/rhf-inputs/table-inputs/table-numerical-input';
import { TableTextInput } from '../../utils/rhf-inputs/table-inputs/table-text-input';
import { TemporaryLimit } from '../../../services/network-modification-types';
import { ColumnNumeric, ColumnText, DndColumnType } from 'components/utils/dnd-table/dnd-table.type';

const styles = {
    columnsStyle: {
        display: 'inline-flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 1,
        textTransform: 'none',
    },
};

interface CustomTableCellProps {
    name: string;
    column: ColumnText | ColumnNumeric;
    disabled: boolean;
    previousValue: number | undefined;
    valueModified: boolean;
}

function EditableTableCell({ name, column, previousValue, valueModified, ...props }: Readonly<CustomTableCellProps>) {
    return (
        <TableCell sx={{ padding: 0.5, maxWidth: column.maxWidth }}>
            {column.type === DndColumnType.NUMERIC ? (
                <TableNumericalInput
                    name={name}
                    previousValue={previousValue}
                    valueModified={valueModified}
                    {...props}
                />
            ) : (
                <TableTextInput name={name} showErrorMsg={column.showErrorMsg} {...props} />
            )}
        </TableCell>
    );
}

interface TemporaryLimitsTableProps {
    arrayFormName: string;
    columnsDefinition: (ColumnText | ColumnNumeric)[];
    createRow: () => any[];
    disabled?: boolean;
    previousValues: TemporaryLimit[];
    disableTableCell: (
        rowIndex: number,
        column: ColumnText | ColumnNumeric,
        arrayFormName: string,
        temporaryLimits: TemporaryLimit[]
    ) => boolean;
    getPreviousValue: (
        rowIndex: number,
        column: ColumnText | ColumnNumeric,
        arrayFormName: string,
        temporaryLimits: TemporaryLimit[]
    ) => number | undefined;
    isValueModified: (rowIndex: number, arrayFormName: string) => boolean;
    disableAddingRows?: boolean;
}

function TemporaryLimitsTable({
    arrayFormName,
    columnsDefinition,
    createRow,
    disabled = false,
    previousValues,
    disableTableCell,
    getPreviousValue,
    isValueModified,
    disableAddingRows = false,
}: Readonly<TemporaryLimitsTableProps>) {
    const { fields, append, remove } = useFieldArray({ name: arrayFormName });
    const [hoveredRowIndex, setHoveredRowIndex] = useState(-1);

    function renderTableCell(rowId: string, rowIndex: number, column: ColumnText | ColumnNumeric) {
        const name = `${arrayFormName}[${rowIndex}].${column.dataKey}`;
        return (
            <EditableTableCell
                key={rowId + column.dataKey}
                name={name}
                column={column}
                disabled={
                    disableTableCell ? disableTableCell(rowIndex, column, arrayFormName, previousValues) : disabled
                }
                previousValue={
                    getPreviousValue ? getPreviousValue(rowIndex, column, arrayFormName, previousValues) : undefined
                }
                valueModified={isValueModified ? isValueModified(rowIndex, arrayFormName) : false}
            />
        );
    }

    function handleAddRowButton() {
        const rowsToAdd = createRow().map((row) => {
            return { ...row, [SELECTED]: false };
        });

        append(rowsToAdd);
    }

    function renderTableHead() {
        return (
            <TableHead>
                <TableRow>
                    {columnsDefinition.map((column) => (
                        <TableCell key={column.dataKey} sx={{ width: column.width, maxWidth: column.maxWidth }}>
                            <Box sx={styles.columnsStyle}>{column.label}</Box>
                        </TableCell>
                    ))}
                    <TableCell>
                        <IconButton
                            color="primary"
                            onClick={handleAddRowButton}
                            disabled={disabled || disableAddingRows}
                        >
                            <AddCircleIcon />
                        </IconButton>
                    </TableCell>
                </TableRow>
            </TableHead>
        );
    }

    const renderTableRow = (rowId: string, index: number) => (
        <TableRow onMouseEnter={() => setHoveredRowIndex(index)} onMouseLeave={() => setHoveredRowIndex(-1)}>
            {columnsDefinition.map((column) => renderTableCell(rowId, index, column))}
            <TableCell key={rowId + 'delete'}>
                <IconButton color="primary" onClick={() => remove(index)}>
                    <DeleteIcon visibility={index === hoveredRowIndex ? 'visible' : 'hidden'} />
                </IconButton>
            </TableCell>
        </TableRow>
    );

    function renderTableBody() {
        return (
            <TableBody>
                {fields.map((value: Record<'id', string>, index: number) => renderTableRow(value.id, index))}
            </TableBody>
        );
    }

    return (
        <Grid item container spacing={1}>
            <Grid item container>
                <TableContainer
                    sx={{
                        height: 400,
                        border: 'solid 1px rgba(0,0,0,0.1)',
                    }}
                >
                    <Table stickyHeader size="small" padding="none">
                        {renderTableHead()}
                        {renderTableBody()}
                    </Table>
                </TableContainer>
                <ErrorInput name={arrayFormName} InputField={FieldErrorAlert} />
            </Grid>
        </Grid>
    );
}

export default TemporaryLimitsTable;
