/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { RawReadOnlyInput } from '@gridsuite/commons-ui';
import PropTypes from 'prop-types';
import { ErrorInput } from '@gridsuite/commons-ui';
import { FieldErrorAlert } from '@gridsuite/commons-ui';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { SELECTED } from '../../utils/field-constants';
import { TableNumericalInput } from '../../utils/rhf-inputs/table-inputs/table-numerical-input';
import { TableTextInput } from '../../utils/rhf-inputs/table-inputs/table-text-input';
import { MAX_ROWS_NUMBER } from '../../utils/dnd-table/dnd-table';

const styles = {
    columnsStyle: {
        display: 'inline-flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 1,
        textTransform: 'none',
    },
};

function DefaultTableCell({ key, name, column, ...props }) {
    return (
        <TableCell key={key} sx={{ padding: 1 }}>
            <RawReadOnlyInput name={name} {...props} />
        </TableCell>
    );
}

function EditableTableCell({ key, name, column, previousValue, valueModified, ...props }) {
    return (
        <TableCell key={key} sx={{ padding: 0.5, maxWidth: column.maxWidth }}>
            {column.numeric ? (
                <TableNumericalInput
                    name={name}
                    previousValue={previousValue}
                    valueModified={valueModified}
                    adornment={column?.adornment}
                    isClearable={column?.clearable}
                    style={{
                        textAlign: column?.textAlign,
                    }}
                    {...props}
                />
            ) : (
                <TableTextInput name={name} showErrorMsg={column.showErrorMsg} {...props} />
            )}
        </TableCell>
    );
}

const TemporaryLimitsTable = ({
    arrayFormName,
    columnsDefinition, // ILimitColumnDef[]
    createRows,
    disabled = false,
    previousValues,
    disableTableCell,
    getPreviousValue,
    isValueModified,
    disableAddingRows = false,
}) => {
    const { setError, clearErrors } = useFormContext();
    const { append, remove } = useFieldArray({ name: arrayFormName });
    const [hoveredRowIndex, setHoveredRowIndex] = useState(-1);
    const temporaryLimits /*: TemporaryLimit[]*/ = useWatch({
        name: arrayFormName,
    });

    function renderTableCell(rowId, rowIndex, column) {
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
        // checking if not exceeding 100 steps
        if (temporaryLimits.length >= MAX_ROWS_NUMBER) {
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

        const rowsToAdd = createRows(1).map((row) => {
            return { ...row, [SELECTED]: false };
        });

        // note : an id prop is automatically added in each row
        append(rowsToAdd);
    }

    function renderTableHead() {
        return (
            <TableHead>
                <TableRow>
                    {columnsDefinition.map((column) => (
                        <TableCell key={column.dataKey} sx={{ width: column.width, maxWidth: column.maxWidth }}>
                            <Box sx={styles.columnsStyle}>
                                {column.label}
                                {column.extra}
                            </Box>
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

    const renderTableRow = (temporaryLimit, index) => (
        <TableRow onMouseEnter={() => setHoveredRowIndex(index)} onMouseLeave={() => setHoveredRowIndex(-1)}>
            {
                columnsDefinition.map((column) =>
                    renderTableCell(arrayFormName + temporaryLimit.name, index, column)
                ) /* TODO ajouter le om du limit set dans la key ??*/
            }
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
                {temporaryLimits.map((temporaryLimit, index) => renderTableRow(temporaryLimit, index))}
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
};

TemporaryLimitsTable.propTypes = {
    arrayFormName: PropTypes.string.isRequired,
    columnsDefinition: PropTypes.array.isRequired,
    allowedToAddRows: PropTypes.func,
    createRows: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

export default TemporaryLimitsTable;
