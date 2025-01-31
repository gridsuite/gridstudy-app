/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useIntl } from 'react-intl';
import { AutocompleteInput, RawReadOnlyInput } from '@gridsuite/commons-ui';
import PropTypes from 'prop-types';
import { ErrorInput } from '@gridsuite/commons-ui';
import { FieldErrorAlert } from '@gridsuite/commons-ui';
import { DirectoryItemsInput } from '@gridsuite/commons-ui';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { SELECTED } from '../../utils/field-constants';
import { TableNumericalInput } from '../../utils/rhf-inputs/table-inputs/table-numerical-input';
import { TableTextInput } from '../../utils/rhf-inputs/table-inputs/table-text-input';
import ChipItemsInput from '../../utils/rhf-inputs/chip-items-input';
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

function DefaultTableCell({ arrayFormName, rowIndex, column, ...props }) {
    return (
        <TableCell key={column.dataKey} sx={{ padding: 1 }}>
            <RawReadOnlyInput name={`${arrayFormName}[${rowIndex}].${column.dataKey}`} {...props} />
        </TableCell>
    );
}

function EditableTableCell({ arrayFormName, rowIndex, column, previousValue, valueModified, ...props }) {
    return (
        <TableCell key={column.dataKey} sx={{ padding: 0.5, maxWidth: column.maxWidth }}>
            {column.numeric && (
                <TableNumericalInput
                    name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                    previousValue={previousValue}
                    valueModified={valueModified}
                    adornment={column?.adornment}
                    isClearable={column?.clearable}
                    style={{
                        textAlign: column?.textAlign,
                    }}
                    {...props}
                />
            )}
            {!column.numeric && !column.directoryItems && !column.chipItems && !column.autocomplete && (
                <TableTextInput
                    name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                    showErrorMsg={column.showErrorMsg}
                    {...props}
                />
            )}
            {column.autocomplete && (
                <AutocompleteInput
                    forcePopupIcon
                    freeSolo
                    name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                    options={column.options}
                    inputTransform={(value) => (value === null ? '' : value)}
                    outputTransform={(value) => value}
                    size={'small'}
                />
            )}
            {column.directoryItems && (
                <DirectoryItemsInput
                    name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                    equipmentTypes={column.equipmentTypes}
                    elementType={column.elementType}
                    titleId={column.titleId}
                    hideErrorMessage={true}
                />
            )}
            {column.chipItems && (
                <ChipItemsInput name={`${arrayFormName}[${rowIndex}].${column.dataKey}`} hideErrorMessage={true} />
            )}
        </TableCell>
    );
}

const TemporaryLimitsTable = ({
    arrayFormName,
    columnsDefinition,
    allowedToAddRows = () => Promise.resolve(true),
    createRows,
    disabled = false,
    previousValues,
    disableTableCell,
    getPreviousValue,
    isValueModified,
    disableAddingRows = false,
}) => {
    const intl = useIntl();

    const { getValues, setError, clearErrors } = useFormContext();

    const {
        fields: currentRows, // don't use it to access form data ! check doc
        move,
        swap,
        append,
        remove,
    } = useFieldArray({ name: arrayFormName });

    const [hoveredRowIndex, setHoveredRowIndex] = useState(-1);

    function renderTableCell(rowId, rowIndex, column) {
        let CustomTableCell = column.editable ? EditableTableCell : DefaultTableCell;
        return (
            <CustomTableCell
                key={rowId + column.dataKey}
                arrayFormName={arrayFormName}
                rowIndex={rowIndex}
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

    function handleAddRowsButton() {
        allowedToAddRows().then((isAllowed) => {
            if (isAllowed) {
                addNewRows(1);
            }
        });
    }

    function addNewRows(numberOfRows) {
        // checking if not exceeding 100 steps
        if (currentRows.length + numberOfRows > MAX_ROWS_NUMBER) {
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

        const rowsToAdd = createRows(numberOfRows).map((row) => {
            return { ...row, [SELECTED]: false };
        });

        // note : an id prop is automatically added in each row
        append(rowsToAdd);
    }

    function deleteSelectedRows() {
        const currentRowsValues = getValues(arrayFormName);

        let rowsToDelete = [];
        for (let i = 0; i < currentRowsValues.length; i++) {
            if (currentRowsValues[i][SELECTED]) {
                rowsToDelete.push(i);
            }
        }

        remove(rowsToDelete);
    }

    function moveUpSelectedRows() {
        const currentRowsValues = getValues(arrayFormName);

        if (currentRowsValues[0][SELECTED]) {
            // we can't move up more the rows, so we stop
            return;
        }

        for (let i = 1; i < currentRowsValues.length; i++) {
            if (currentRowsValues[i][SELECTED]) {
                swap(i - 1, i);
            }
        }
    }

    function moveDownSelectedRows() {
        const currentRowsValues = getValues(arrayFormName);

        if (currentRowsValues[currentRowsValues.length - 1][SELECTED]) {
            // we can't move down more the rows, so we stop
            return;
        }

        for (let i = currentRowsValues.length - 2; i >= 0; i--) {
            if (currentRowsValues[i][SELECTED]) {
                swap(i, i + 1);
            }
        }
    }

    function onDragEnd(result) {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        move(result.source.index, result.destination.index);
    }

    function renderTableHead() {
        return (
            <TableHead>
                <TableRow>
                    <TableCell sx={{ width: '3%' }}>{/* empty cell for the drag and drop column */}</TableCell>
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
                            onClick={handleAddRowsButton}
                            disabled={disabled || disableAddingRows}
                        >
                            <AddCircleIcon />
                        </IconButton>
                    </TableCell>
                </TableRow>
            </TableHead>
        );
    }

    const renderTableRow = (row, provided, index) => (
        <TableRow
            ref={provided.innerRef}
            {...provided.draggableProps}
            onMouseEnter={() => setHoveredRowIndex(index)}
            onMouseLeave={() => setHoveredRowIndex(-1)}
        >
            <Tooltip
                title={intl.formatMessage({
                    id: 'DragAndDrop',
                })}
                placement="right"
            >
                <TableCell sx={{ textAlign: 'center' }} {...(disabled ? {} : { ...provided.dragHandleProps })}>
                    <DragIndicatorIcon />
                </TableCell>
            </Tooltip>
            {columnsDefinition.map((column) => renderTableCell(row.id, index, column))}
            {index === hoveredRowIndex && (
                <TableCell>
                    <IconButton color="primary" onClick={() => remove(index)}>
                        <DeleteIcon />
                    </IconButton>
                </TableCell>
            )}
        </TableRow>
    );

    function renderTableBody(providedDroppable) {
        return (
            <TableBody>
                {currentRows.map((row, index) => (
                    <Draggable key={row.id} draggableId={row.id.toString()} index={index}>
                        {(provided, snapshot) => renderTableRow(row, provided, index)}
                    </Draggable>
                ))}
                {providedDroppable.placeholder}
            </TableBody>
        );
    }

    return (
        <Grid item container spacing={1}>
            <Grid item container>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="tapTable" isDropDisabled={disabled}>
                        {(provided, snapshot) => (
                            <TableContainer
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                sx={{
                                    height: 400,
                                    border: 'solid 1px rgba(0,0,0,0.1)',
                                }}
                            >
                                <Table stickyHeader size="small" padding="none">
                                    {renderTableHead()}
                                    {renderTableBody(provided)}
                                </Table>
                            </TableContainer>
                        )}
                    </Droppable>
                </DragDropContext>
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
