/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { RawReadOnlyInput } from '@gridsuite/commons-ui';
import { ErrorInput } from '@gridsuite/commons-ui';
import { FieldErrorAlert } from '@gridsuite/commons-ui';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { SELECTED } from '../../utils/field-constants';
import { TableNumericalInput } from '../../utils/rhf-inputs/table-inputs/table-numerical-input';
import { TableTextInput } from '../../utils/rhf-inputs/table-inputs/table-text-input';
import { ILimitColumnDef } from './limits-side-pane';
import { TemporaryLimit } from '../../../services/network-modification-types';

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
    key: string;
    name: string;
    column: ILimitColumnDef;
    disabled: boolean;
    previousValue: number | string | null | undefined;
    valueModified: boolean;
}

function DefaultTableCell({ key, name, column, ...props }: Readonly<CustomTableCellProps>) {
    return (
        <TableCell key={key} sx={{ padding: 1 }}>
            <RawReadOnlyInput name={name} {...props} />
        </TableCell>
    );
}

function EditableTableCell({
    key,
    name,
    column,
    previousValue,
    valueModified,
    ...props
}: Readonly<CustomTableCellProps>) {
    return (
        <TableCell key={key} sx={{ padding: 0.5, maxWidth: column.maxWidth }}>
            {column.numeric ? (
                <TableNumericalInput
                    style={undefined}
                    inputProps={undefined}
                    adornment={undefined}
                    name={name}
                    previousValue={previousValue}
                    valueModified={valueModified}
                    {...props}
                />
            ) : (
                <TableTextInput
                    style={undefined}
                    inputProps={undefined}
                    name={name}
                    showErrorMsg={column.showErrorMsg}
                    {...props}
                />
            )}
        </TableCell>
    );
}

interface TemporaryLimitsTableProps {
    arrayFormName: string;
    columnsDefinition: ILimitColumnDef[];
    createRow: () => any[];
    disabled?: boolean;
    previousValues: TemporaryLimit[];
    disableTableCell: (
        rowIndex: number,
        column: ILimitColumnDef,
        arrayFormName: string,
        temporaryLimits: TemporaryLimit[]
    ) => boolean;
    getPreviousValue: (
        rowIndex: number,
        column: ILimitColumnDef,
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
    const { watch } = useForm();
    const { fields, append, remove } = useFieldArray({ name: arrayFormName });
    const [hoveredRowIndex, setHoveredRowIndex] = useState(-1);
    /*const temporaryLimits: TemporaryLimit[] = useWatch({
        name: arrayFormName,
    });*/

    function renderTableCell(rowId: string, rowIndex: number, column: ILimitColumnDef) {
        let CustomTableCell = column.editable ? EditableTableCell : DefaultTableCell;
        const name = `${arrayFormName}[${rowIndex}].${column.dataKey}`;
        return (
            <CustomTableCell
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

        // note : an id prop is automatically added in each row
        append(rowsToAdd);
    }

    function renderTableHead() {
        return (
            <TableHead>
                <TableRow>
                    {columnsDefinition.map((column: ILimitColumnDef) => (
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

    const renderTableRow = (id: string, index: number) => (
        <TableRow onMouseEnter={() => setHoveredRowIndex(index)} onMouseLeave={() => setHoveredRowIndex(-1)}>
            {columnsDefinition.map((column) => renderTableCell(id, index, column))}
            {index === hoveredRowIndex && (
                <TableCell>
                    <IconButton color="primary" onClick={() => remove(index)}>
                        <DeleteIcon />
                    </IconButton>
                </TableCell>
            )}
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
